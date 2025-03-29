import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // References User
    name: { type: String, required: true },
  },
  { collection: "categories", timestamps: true } // This will add createdAt and updatedAt fields to the schema
);
export default mongoose.model("Category", CategorySchema);

