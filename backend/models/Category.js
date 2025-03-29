const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId, // category_id
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // References User
    name: { type: String, required: true },
  },
  { collection: "categories" }
);

module.exports = mongoose.model("Category", CategorySchema);
