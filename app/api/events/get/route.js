// app/api/events/get/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET() {
  await dbConnect();

  try {
    const events = await Event.find({}).sort({ date: 1 });
    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
