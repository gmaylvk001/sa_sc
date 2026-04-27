// app/api/events/create/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { title, date, status } = body;

    const event = await Event.create({
      title,
      date,
      status,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
