import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import GalleryCategory from "@/models/GalleryCategory";
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function saveFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads/gallery");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // always save as webp
  const filename =
    Date.now() +
    "-" +
    file.name.replace(/\s/g, "_").replace(/\.[^/.]+$/, "") +
    ".webp";

  const filepath = path.join(uploadDir, filename);

  const TARGET_KB = 300;
  let quality = 85;
  let outputBuffer;

  while (quality >= 60) {
    outputBuffer = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (outputBuffer.length / 1024 <= TARGET_KB) break;
    quality -= 5;
  }

  await fs.promises.writeFile(filepath, outputBuffer);

  return "/uploads/gallery/" + filename;
}

// =================== GET ===================
export async function GET() {
  await dbConnect();
  const images = await GalleryImage.find().populate("category");
  return NextResponse.json(images);
}

// =================== POST ===================
export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const title = formData.get("title");
    const category = formData.get("category");
    const statusStr = formData.get("status"); // "active"/"inactive"
    const file = formData.get("image");

    if (!title || !category) {
      return NextResponse.json(
        { success: false, message: "Title and category required" },
        { status: 400 }
      );
    }

    if (!file || !file.name) {
      return NextResponse.json(
        { success: false, message: "Image file required" },
        { status: 400 }
      );
    }

    // Upload file
    const imagePath = await saveFile(file);

    const image = await GalleryImage.create({
      title,
      category,
      status: statusStr === "active",
      imageUrl: imagePath,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error("POST /api/gallery/images error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


// =================== DELETE ===================
export async function DELETE(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const img = await GalleryImage.findById(id);

  // ✅ FIX HERE ALSO
  if (img?.imageUrl) {
    const filePath = path.join(process.cwd(), "public", img.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await GalleryImage.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}


export async function PUT(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const id = formData.get("id");
    const title = formData.get("title");
    const category = formData.get("category");
    const statusStr = formData.get("status"); // "active"/"inactive"
    const file = formData.get("image");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Image ID required" },
        { status: 400 }
      );
    }

    const image = await GalleryImage.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (title) image.title = title;
    if (category) image.category = category;
    if (statusStr) image.status = statusStr === "active";

    // Replace image only if new file is provided
    if (file && file.name) {
      const imagePath = await saveFile(file);
      image.imageUrl = imagePath;
    }

    image.updatedAt = new Date();
    await image.save();

    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error("PUT /api/gallery/images error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

