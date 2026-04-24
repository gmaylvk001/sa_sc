import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FlashNews from "@/models/FlashNews";

export async function POST(req) {
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

    const news = await FlashNews.create({
      content,
      publishDate,
      expiryDate,
      priority,
      status,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
