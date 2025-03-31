import express from "express"
import validator from "validator";
import Expense from "../backend/models/Expense.js";
import mongoose from "mongoose";
import { createExpense, getAllExpenses, deleteExpense, getAllExpensesByCategory, getExpenseById, updateExpense } from "../controllers/expense.js";
const router = express.Router();

export default router;


// Expense Create
router.post("/", createExpense);

// Expense Delete
router.delete("/:expenseId", deleteExpense);


// Get all expenses for a user while sanitizing the input
router.get("/:userId", getAllExpenses);


// Get expenses by category for a user while sanitizing the input
router.get("/:userId/category/:categoryId", getAllExpensesByCategory);

// Get expense by ID while sanitizing the input
router.get("/id/:expenseId", getExpenseById);


// Update expense while sanitizing the input
router.patch("/:expenseId", updateExpense);
