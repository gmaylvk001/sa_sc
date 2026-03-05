import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";

export async function POST(req) {
  try {
    await dbConnect();
    const { activityId } = await req.json();

    if (!activityId) {
      return NextResponse.json({ success: false, message: "Activity ID is required" }, { status: 400 });
    }

    await Activity.findByIdAndDelete(activityId);
    return NextResponse.json({ success: true, message: "Activity deleted successfully" });
  } catch (err) {
    console.error("POST /activities/delete error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
