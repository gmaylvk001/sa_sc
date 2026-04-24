import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FlashNews from "@/models/FlashNews";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    const { content, publishDate, expiryDate, priority, status } = body;

    if (!content || !publishDate) {
      return NextResponse.json({
        success: false,
        message: "Content & Publish Date required",
      });
    }

    const updated = await FlashNews.findByIdAndUpdate(
      params.id,
      {
        content,
        publishDate,
        expiryDate,
        priority,
        status,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
