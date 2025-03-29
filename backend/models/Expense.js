const mongoose = require("mongoose");

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
  { collection: "expenses" }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
