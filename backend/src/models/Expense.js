import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
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
      default: Date.now,
    },
  },
  { collection: "expenses", timestamps: true }
);
ExpenseSchema.index({ date: 1 });          
ExpenseSchema.index({ category: 1 });
export default mongoose.model("Expense", ExpenseSchema);
      