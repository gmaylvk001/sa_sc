import dbConnect from "@/lib/db";
import BlogCategory from "@/models/ecom_blog_category_info";

export async function GET(req) {
  await dbConnect();
  const categories = await BlogCategory.find({}).sort({ createdAt: -1 });
  return new Response(JSON.stringify(categories), { status: 200 });
}

export async function POST(req) {
  await dbConnect();
  try {
    const { name, slug, status } = await req.json();
    const category = await BlogCategory.create({ name, slug, status });
    return new Response(JSON.stringify({ success: true, category }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 400 });
  }
}
