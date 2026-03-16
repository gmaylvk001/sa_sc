import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// ─── Config ───────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;                        // ← was missing in your version
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;  // ← was missing in your version

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars first
    .replace(/[\s_]+/g, "-")        // spaces to hyphens
    .replace(/-+/g, "-");           // collapse double hyphens

async function saveImage(file, folder = "activities") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), `public/uploads/${folder}`);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
      .resize({
        width: 1600,
        height: 900,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
    if (outputBuffer.length / 1024 <= TARGET_KB) break;
    quality -= 5;
  }

  await fs.promises.writeFile(filepath, outputBuffer);
  return `/uploads/${folder}/` + filename;
}

// ─── Validate a single file ───────────────────────────────────────────────────
function validateImageFile(file, label = "Image") {
  if (!file || !file.name) return null; // no file — skip

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    return `${label} must be a valid image (JPEG, PNG, WEBP, GIF).`;
  }

  if (file.size > MAX_BYTES) {
    return `${label} "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
  }

  return null; // valid
}

// ─── POST /api/activities/add ─────────────────────────────────────────────────
export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const name        = formData.get("name");
    const tagline     = formData.get("tagline") || "";
    const description = formData.get("description");
    const status      = formData.get("status") || "Active";
    const order       = formData.get("order") || 0;
    const highlights  = JSON.parse(formData.get("highlights") || "[]");

    // ── Validate required fields ─────────────────────────────────────────────
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required." },
        { status: 400 }
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
    const galleryFiles = formData.getAll("gallery");
    for (let i = 0; i < galleryFiles.length; i++) {
      const galleryError = validateImageFile(
        galleryFiles[i],
        `Gallery image ${i + 1}`
      );
      if (galleryError) {
        return NextResponse.json(
          { success: false, message: galleryError },
          { status: 400 }
        );
      }
    }

    // ── Save banner image ────────────────────────────────────────────────────
    let imageSrc = "";
    if (bannerFile && bannerFile.name) {
      imageSrc = await saveImage(bannerFile, "activities");
    }

    // ── Save gallery images ──────────────────────────────────────────────────
    const gallery = [];
    for (const file of galleryFiles) {
      if (file && file.name) {
        const url = await saveImage(file, "activities/gallery");
        gallery.push(url);
      }
    }

    // ── Check for duplicate slug ─────────────────────────────────────────────
    const slug = slugify(name);
    const existing = await Activity.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Activity with this name already exists." },
        { status: 400 }
      );
    }

    // ── Save to DB ───────────────────────────────────────────────────────────
    const activity = new Activity({
      name,
      slug,
      tagline,
      description,
      highlights,
      imageSrc,
      gallery,
      status,
      order,
    });
    await activity.save();

    return NextResponse.json(
      { success: true, message: "Activity added successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /activities/add error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
