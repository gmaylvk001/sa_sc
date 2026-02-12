import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/ecom_blog_info";
import fs from "fs";
import path from "path";
import sharp from "sharp";


// --------------------
// Utility: clean slug
// --------------------
const slugify = (text) => {
  return text
    .toLowerCase()               // lowercase
    .trim()                      // remove leading/trailing spaces
    .replace(/[\s_]+/g, "-")     // replace spaces or underscores with a single dash
    .replace(/-+/g, "-")         // replace multiple dashes with a single dash
    .replace(/[^a-z0-9-]/g, ""); // remove all non-alphanumeric except dash
};
// --------------------
// Utility: save & compress image
// --------------------
async function saveImage(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads/blogs");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Save as webp
  const filename =
    Date.now() +
    "-" +
    file.name.replace(/\s/g, "_").replace(/\.[^/.]+$/, "") +
    ".webp";
  const filepath = path.join(uploadDir, filename);

  // Compression loop
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
  return "/uploads/blogs/" + filename;
}

// --------------------
// POST Blog
// --------------------
export async function POST(req) {
  try {
    await dbConnect();

    const contentType = req.headers.get("content-type");

    // Handle JSON body (no file)
    if (contentType.includes("application/json")) {
      const { name, description, category, status } = await req.json();

      const newBlog = new Blog({
        blog_name: name,
        blog_slug: slugify(name),
        description,
        category,
        status,
      });

      await newBlog.save();
      return NextResponse.json(
        { success: true, message: "Blog added successfully" },
        { status: 201 }
      );
    }

    // Handle multipart/form-data (with file)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = formData.get("name");
      const description = formData.get("description");
      const category = formData.get("category");
      const status = formData.get("status");
      const image = formData.get("image");

      let imageUrl = "";

      if (image && image.name) {
        imageUrl = await saveImage(image); // compress + save
      }

      const newBlog = new Blog({
        blog_name: name,
        blog_slug: slugify(name),
        description,
        category,
        status,
        image: imageUrl,
      });

      await newBlog.save();
      return NextResponse.json(
        { success: true, message: "Blog added successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid content type" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST /blogs error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
