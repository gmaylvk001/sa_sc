import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FlashNews from "@/models/FlashNews";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    await FlashNews.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
