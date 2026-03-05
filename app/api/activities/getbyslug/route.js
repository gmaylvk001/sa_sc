import dbConnect from "@/lib/db";
import Activity from "@/models/school_activity_info";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return Response.json({ success: false, error: "Slug is required" }, { status: 400 });
    }

    const activity = await Activity.findOne({ slug, status: "Active" });

    if (!activity) {
      return Response.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: activity });
  } catch (error) {
    console.error("GET /activities/getbyslug error:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
