import mongoose from "mongoose";

const FlashNewsSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },   // ✅ change from title
    publishDate: { type: Date, required: true }, // ✅ correct field
    expiryDate: { type: Date },
    priority: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true } // ✅ createdAt & updatedAt auto
);

export default mongoose.models.FlashNews ||
  mongoose.model("FlashNews", FlashNewsSchema);
