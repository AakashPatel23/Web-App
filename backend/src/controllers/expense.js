import Expense from "../models/Expense.js";
import validator from "validator";
import mongoose from "mongoose";

export const createExpense = async (req, res) => {
  const expense = req.body; // Assuming you're sending expense data in the request body

  // Basic validation for required fields
  if (!expense || !expense.name || !expense.amount || !expense.category) {
    return res.status(400).json({
      success: false,
      message: "Expense name, amount, and category are required.",
    });
  }

  // Validate that the amount is a valid number
  if (isNaN(expense.amount) || expense.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number.",
    });
  }

  // Sanitize the expense name and description (if provided)
  expense.name = validator.escape(expense.name.trim()); // Sanitize and trim the expense name
  expense.description = expense.description
    ? validator.escape(expense.description.trim())
    : null; // Sanitize notes (if provided)

  let expenseDate;
  if (expense.date) {
    if (!validator.isISO8601(expense.date)) {
      // Check if date is in valid format
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD.",
      });
    }
    expenseDate = new Date(expense.date);
  } else {
    expenseDate = Date.now();
  }
  try {
    // Create the new expense object
    const newExpense = new Expense({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expenseDate,
    });

    // Save the new expense to the database
    await newExpense.save();

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense: {
        name: newExpense.name,
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date,
      },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    // Fetch expenses for the user and populate the category name
    const expenses = await Expense.find({})
      .populate("category", "name") // Populate category name
      .sort({ date: -1 }); // Sort expenses by date in descending order

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No expenses found." });
    }

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getAllExpensesByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID." });
    }

    // Fetch expenses for the user filtered by category and populate the category name
    const expenses = await Expense.find({ category: categoryId })
      .populate("category", "name") // Populate category name
      .sort({ date: -1 }); // Sort expenses by date in descending order

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No expenses found for this category.",
      });
    }

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expense ID." });
    }

    // Fetch the expense by ID and populate the category name
    const expense = await Expense.findById(expenseId).populate(
      "category",
      "name"
    ); // Populate category name

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found." });
    }

    return res.status(200).json({ success: true, expense });
  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { name, amount, category, description, date } = req.body;

    // Validate expenseId
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expense ID." });
    }

    // Create an update object with sanitized fields
    const updates = {};
    if (name) updates.name = validator.escape(name.trim());
    if (amount && !isNaN(amount) && amount > 0) updates.amount = amount;
    if (category) updates.category = category;
    if (description) updates.description = validator.escape(description.trim());
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) updates.date = parsedDate;
    }

    // Ensure at least one field is provided
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update." });
    }

    // Update the expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found." });
    }

    return res.json({
      success: true,
      message: "Expense updated successfully.",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
