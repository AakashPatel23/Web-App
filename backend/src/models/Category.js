import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
  },
  { collection: "categories", timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
