// app/api/events/update/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const body = await req.json();
    const event = await Event.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
