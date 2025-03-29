import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Expense from "./models/Expense.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
//app.use("/record", records);

// start the Express server
app.listen(PORT, () => {
  connectDB(); // Call the function to connect to the database
  console.log(`Server listening on port ${PORT}`);
});

app.post("/api/users", async (req, res) => {
  const user = req.body.user; // Assuming you're sending user data in the request body

  // Basic validation for required fields
  if (
    !user ||
    !user.username ||
    !user.password ||
    user.username.length < 3 ||
    user.username.includes(" ")
  ) {
    // Invalid user data
    return res.status(400).json({
      success: false,
      message:
        "Invalid user data. Please provide a valid username and password.",
    });
  }

  // Password requirements check
  if (
    user.password.length < 6 ||
    user.password.search(/[A-Z]/) === -1 ||
    user.password.search(/[0-9]/) === -1 ||
    user.password.search(/[@$!%*?&]/) === -1 ||
    user.password.search(/[a-z]/) === -1 ||
    user.password.includes(" ")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters long, contain an uppercase and lowercase letter, a number, and a special character.",
    });
  }

  // Sanitize the username and password
  user.username = validator.escape(user.username.trim()); // Remove any harmful characters and trim whitespace
  user.password = validator.escape(user.password.trim()); // Remove harmful characters and trim whitespace

  // Check for duplicate username
  try {
    const existingUser = await User.findOne({ username: user.username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different one.",
      });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Create the new user object with the hashed password
    const newUser = new User({
      username: user.username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        username: newUser.username, // Don't send the password in the response for security reasons
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle errors, such as duplicate username
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different one.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});





app.post("/api/categories", async (req, res) => {
  const category = req.body.category; // Assuming you're sending category data in the request body

  // Basic validation for required fields
  if (!category || !category.name || category.name.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Category name must be at least 3 characters long.",
    });
  }

  // Sanitize the category name
  category.name = validator.escape(category.name.trim()); // Escape harmful characters and trim whitespace

  try {
    // Check if category already exists for the user
    const existingCategory = await Category.findOne({
      name: category.name,
      user: category.user,
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists. Please choose a different one.",
      });
    }

    // Create the new category object
    const newCategory = new Category({
      user: category.user,
      name: category.name,
    });

    // Save the new category to the database
    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: {
        name: newCategory.name, // Return only the name and user to avoid exposing sensitive data
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});


app.post("/api/expenses", async (req, res) => {
  const expense = req.body.expense; // Assuming you're sending expense data in the request body

  // Basic validation for required fields
  if (
    !expense ||
    !expense.name ||
    !expense.amount ||
    !expense.category ||
    !expense.date
  ) {
    return res.status(400).json({
      success: false,
      message: "Expense name, amount, category, and date are required.",
    });
  }

  // Validate that the amount is a valid number
  if (isNaN(expense.amount) || expense.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number.",
    });
  }

  // Sanitize the expense name and notes (if provided)
  expense.name = validator.escape(expense.name.trim()); // Sanitize and trim the expense name
  expense.notes = expense.notes ? validator.escape(expense.notes.trim()) : null; // Sanitize notes (if provided)

  try {
    // Create the new expense object
    const newExpense = new Expense({
      user: expense.user,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes,
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
        date: newExpense.date,
        notes: newExpense.notes,
      },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});
