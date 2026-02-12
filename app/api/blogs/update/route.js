import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/ecom_blog_info";
import fs from "fs";
import path from "path";
import sharp from "sharp";


const slugify = (text) => {
  return text
    .toLowerCase()               // lowercase
    .trim()                      // remove leading/trailing spaces
    .replace(/[\s_]+/g, "-")     // replace spaces or underscores with a single dash
    .replace(/-+/g, "-")         // replace multiple dashes with a single dash
    .replace(/[^a-z0-9-]/g, ""); // remove all non-alphanumeric except dash
};

// --------------------
// Helper: save & compress image
// --------------------
async function saveCompressedImage(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads/blogs");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Save as webp
  const filename =
    `blog_${Date.now()}.webp`; // always webp for compression
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
  return `/uploads/blogs/${filename}`;
}

// --------------------
// PUT: Edit Blog
// --------------------
export async function PUT(req) {
  try {
    await dbConnect();

    const contentType = req.headers.get("content-type");
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, error: "Invalid Content-Type" }, { status: 400 });
    }

    const formData = await req.formData();

    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const status = formData.get("status");
    const image = formData.get("image");
    const existingImage = formData.get("existingImage");

    // Find the existing blog
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    let imageUrl = existingImage;

    // If a new image is uploaded
    if (image && image.name) {
      // Delete old image if exists
      if (existingImage) {
        const oldImagePath = path.join(process.cwd(), "public", existingImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      // Save and compress new image
      imageUrl = await saveCompressedImage(image);
    }

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        blog_name: name,
        blog_slug: slugify(name),
        description,
        category,
        status,
        image: imageUrl,
      },
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: "Blog updated successfully", data: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
