import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, unique: true, required: true },
  tagline:     { type: String, default: "" },
  description: { type: String, required: true },
  highlights:  { type: [String], default: [] },
  imageSrc:    { type: String, default: "" },  // banner image
  gallery:     { type: [String], default: [] }, // multiple gallery images
  status:      { type: String, enum: ["Active", "Inactive"], default: "Active" },
  order:       { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

const Activity =
  mongoose.models.school_activity_info ||
  mongoose.model("school_activity_info", ActivitySchema);

export default Activity;
