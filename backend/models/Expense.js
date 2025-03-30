import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, default: null },
    date: {
      type: Date,
      default: Date.now, // Default to the current date if not provided
    },
  },
  { collection: "expenses", timestamps: true } // This will add createdAt and updatedAt fields to the schema
);

export default mongoose.model("Expense", ExpenseSchema);
