import mongoose from "mongoose";

const BlogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Use the same name in check and definition
const BlogCategory =
  mongoose.models.ecom_blog_category_info ||
  mongoose.model("ecom_blog_category_info", BlogCategorySchema);

export default BlogCategory;
