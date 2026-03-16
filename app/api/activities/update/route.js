import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// ─── Config ───────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars first
    .replace(/[\s_]+/g, "-")        // spaces to hyphens
    .replace(/-+/g, "-");           // collapse double hyphens

// ─── Validate a single file ───────────────────────────────────────────────────
function validateImageFile(file, label = "Image") {
  if (!file || !file.name) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    return `${label} must be a valid image (JPEG, PNG, WEBP, GIF).`;
  }

  if (file.size > MAX_BYTES) {
    return `${label} "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
  }

  return null;
}

// ─── Save image helper ────────────────────────────────────────────────────────
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

// ─── POST /api/activities/update ─────────────────────────────────────────────
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

    // ── Find activity ────────────────────────────────────────────────────────
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Activity not found." },
        { status: 404 }
      );
    }

    // ── Validate banner image ────────────────────────────────────────────────
    const bannerFile = formData.get("imageSrc");
    const bannerError = validateImageFile(bannerFile, "Banner image");
    if (bannerError) {
      return NextResponse.json(
        { success: false, message: bannerError },
        { status: 400 }
      );
    }

    // ── Validate gallery images ──────────────────────────────────────────────
    const newGalleryFiles = formData.getAll("gallery");
    for (let i = 0; i < newGalleryFiles.length; i++) {
      const galleryError = validateImageFile(newGalleryFiles[i], `Gallery image ${i + 1}`);
      if (galleryError) {
        return NextResponse.json(
          { success: false, message: galleryError },
          { status: 400 }
        );
      }
    }

    // ── Save banner image (only if new file uploaded) ────────────────────────
    let imageSrc = formData.get("existingImageSrc") || activity.imageSrc;
    if (bannerFile && bannerFile.name) {
      imageSrc = await saveImage(bannerFile, "activities");
    }

    // ── Save gallery (keep existing + add new uploads) ───────────────────────
    const existingGallery = JSON.parse(formData.get("existingGallery") || "[]");
    const gallery = [...existingGallery];
    for (const file of newGalleryFiles) {
      if (file && file.name) {
        const url = await saveImage(file, "activities/gallery");
        gallery.push(url);
      }
    }

    // ── Update slug from new name ────────────────────────────────────────────
    const slug = slugify(name);

    // ── Update DB ────────────────────────────────────────────────────────────
    await Activity.findByIdAndUpdate(activityId, {
      name, slug, tagline, description, highlights, imageSrc, gallery, status, order,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Activity updated successfully." }
    );
  } catch (err) {
    console.error("POST /activities/update error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
