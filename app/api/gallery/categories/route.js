import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";


export async function GET() {
  await dbConnect();
  const categories = await GalleryCategory.find();
  return NextResponse.json(categories);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json(); // this is correct
  console.log("Incoming POST body:", body);
  const { name, slug,status } = body;
  const newCategory = await GalleryCategory.create({ name, slug, status});
  return NextResponse.json(newCategory);
}

