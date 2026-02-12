import dbConnect from "@/lib/db";
import Blog from "@/models/ecom_blog_info";
import Category from "@/models/ecom_blog_category_info";

export async function GET(req) {
  try {
    await dbConnect();

    const { search = "", category = "All", page = "1", limit = "6" } = Object.fromEntries(
      new URL(req.url).searchParams
    );

    const filter = { status: "Active" };

    // Search by title or description
    if (search) {
      filter.$or = [
        { blog_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category !== "All") {
      filter.category = category;
    }

    const blogs = await Blog.find(filter)
      .populate("category") // populated category
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);

    return new Response(
      JSON.stringify({
        success: true,
        data: blogs,
        total,
        page: Number(page),
        limit: Number(limit),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
