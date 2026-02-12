import dbConnect from "@/lib/db";
import BlogCategory from "@/models/ecom_blog_category_info";

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const { name, slug, status } = await req.json();
    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { name, slug, status },
      { new: true }
    );
    return new Response(JSON.stringify({ success: true, category }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    await BlogCategory.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 400 });
  }
}
