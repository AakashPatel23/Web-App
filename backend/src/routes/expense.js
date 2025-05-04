import express from "express";
import Expense from "../models/Expense.js";

import {
  createExpense,
  getAllExpenses,
  deleteExpense,
  getAllExpensesByCategory,
  getExpenseById,
  updateExpense,
  generateTotalReport,
  generateCategoryReport,
  getHighestExpense,
  generateNameReport
} from "../controllers/expense.js";
const router = express.Router();

export default router;

// Expense Create
router.post("/", createExpense);

// Expense Delete
router.delete("/:expenseId", deleteExpense);

// Get all expenses for a user while sanitizing the input
router.get("/", getAllExpenses);

// Get expenses by category for a user while sanitizing the input
router.get("/category/:categoryId", async (req, res) => {
  try {
    const expenses = await Expense.find({
      category: req.params.categoryId,
    }).populate("category");
    res.json({ success: true, expenses });
  } catch (err) {
    console.error("Error fetching expenses by category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get expense by ID while sanitizing the input
router.get("/id/:expenseId", getExpenseById);

// Update expense while sanitizing the input
router.patch("/:expenseId", updateExpense);


router.get("/report/total", generateTotalReport);
router.get("/report/by-category", generateCategoryReport);
router.get("/report/by-name", generateNameReport);
router.get("/report/highest", getHighestExpense);