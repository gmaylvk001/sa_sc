import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

export async function DELETE(req, { params }) {
  await dbConnect();
  await GalleryImage.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
