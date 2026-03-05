import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";

export async function GET() {
  try {
    await dbConnect();
    const activities = await Activity.find({}).sort({ order: 1, createdAt: 1 });
    return Response.json({ success: true, data: activities });
  } catch (error) {
    console.error("GET /activities/getall error:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
