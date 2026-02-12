// models/GalleryCategory.js
import mongoose from "mongoose";

const GalleryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
},
{ timestamps: true }
);

export default mongoose.models.GalleryCategory ||
  mongoose.model("GalleryCategory", GalleryCategorySchema);
