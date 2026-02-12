import dbConnect from "@/lib/db";
import Blog from "@/models/ecom_blog_info";
import Category from "@/models/ecom_blog_category_info";

export async function GET(req) { 
  try {
    await dbConnect();
    const blogs = await Blog.find({}).populate("category");

    return Response.json({ success: true, data: blogs || [] });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
