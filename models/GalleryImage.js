import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },

    // ✅ THIS FIELD NAME IS IMPORTANT
    imageUrl: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GalleryCategory",
      required: true
    },

    status: { type: Boolean, default: true }
  }, 
  { timestamps: true }
);

export default mongoose.models.GalleryImage ||
  mongoose.model("GalleryImage", galleryImageSchema);
