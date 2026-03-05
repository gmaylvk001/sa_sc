import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function saveImage(file, folder = "activities") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), `public/uploads/${folder}`);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename =
    Date.now() + "-" +
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
  return `/uploads/${folder}/` + filename;
}

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const activityId  = formData.get("activityId");
    const name        = formData.get("name");
    const tagline     = formData.get("tagline") || "";
    const description = formData.get("description");
    const status      = formData.get("status") || "Active";
    const order       = formData.get("order") || 0;
    const highlights  = JSON.parse(formData.get("highlights") || "[]");

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return NextResponse.json({ success: false, message: "Activity not found" }, { status: 404 });
    }

    // Banner image - update only if new file uploaded
    const bannerFile = formData.get("imageSrc");
    let imageSrc = formData.get("existingImageSrc") || activity.imageSrc;
    if (bannerFile && bannerFile.name) {
      imageSrc = await saveImage(bannerFile, "activities");
    }

    // Gallery - keep existing + add new uploads
    const existingGallery = JSON.parse(formData.get("existingGallery") || "[]");
    const newGalleryFiles = formData.getAll("gallery");
    const gallery = [...existingGallery];
    for (const file of newGalleryFiles) {
      if (file && file.name) {
        const url = await saveImage(file, "activities/gallery");
        gallery.push(url);
      }
    }

    await Activity.findByIdAndUpdate(activityId, {
      name, tagline, description, highlights, imageSrc, gallery, status, order,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Activity updated successfully" });
  } catch (err) {
    console.error("POST /activities/update error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
