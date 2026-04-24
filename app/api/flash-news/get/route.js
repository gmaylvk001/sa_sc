import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FlashNews from "@/models/FlashNews";

export async function GET() {
  try {
    await connectDB();

    const news = await FlashNews.find().sort({ priority: -1 });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
