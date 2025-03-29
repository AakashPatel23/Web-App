import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: null },
  },
  { collection: "expenses", timestamps: true } // This will add createdAt and updatedAt fields to the schema
);

export default mongoose.model("Expense", ExpenseSchema);
