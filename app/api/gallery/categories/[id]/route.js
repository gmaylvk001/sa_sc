import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import GalleryImage from "@/models/GalleryImage";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { name, slug, status } = await req.json();

    // Log incoming data for debugging
    console.log("Updating category:", { id, name, slug, status });

    // Update the category document
    const updatedCategory = await GalleryCategory.findByIdAndUpdate(
      id,
      { name, slug, status },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Update all images that belong to this category to have the same status
    await GalleryImage.updateMany(
      { category: updatedCategory._id },
      { status: status }
    );

    console.log(`Updated images under category ${id} to status ${status}`);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT, DELETE, GET can all live in the same file for /categories/[id]
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    // Check if category has any images
    const imageCount = await GalleryImage.countDocuments({ category: id });

    if (imageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with images" },
        { status: 400 }
      );
    }

    // Safe to delete category
    await GalleryCategory.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
