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
import mongoose from "mongoose";


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










//User Create
app.post("/api/users", async (req, res) => {
  const user = req.body;

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


// User Delete
app.delete("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find all categories associated with the user
    const userCategories = await Category.find({ user: userId });

    // Extract category IDs
    const categoryIds = userCategories.map((category) => category._id);

    // Delete all expenses related to the user's categories
    await Expense.deleteMany({
      $or: [{ user: userId }, { category: { $in: categoryIds } }],
    });

    // Delete all categories associated with the user
    await Category.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: "User, associated categories, and expenses deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


















// Category Create
app.post("/api/categories", async (req, res) => {
  const category = req.body; // Assuming you're sending category data in the request body

  // Basic validation for required fields
  if (!category || !category.name || category.name.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Category name must be at least 3 characters long.",
    });
  }

  // Sanitize the category name
  category.name = validator.escape(category.name.trim()); // Escape harmful characters and trim whitespace
  category.description = category.description
    ? validator.escape(category.description.trim())
    : null; // Sanitize notes (if provided)
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
      description: category.description,
    });

    // Save the new category to the database
    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: {
        name: newCategory.name, // Return only the name and user to avoid exposing sensitive data
        description: category.description,
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


// Category Delete
app.delete("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find and delete the category
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Delete all expenses related to this category
    await Expense.deleteMany({ category: categoryId });

    return res.status(200).json({
      success: true,
      message: "Category and associated expenses deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

















// Expense Create
app.post("/api/expenses", async (req, res) => {
  const expense = req.body; // Assuming you're sending expense data in the request body

  // Basic validation for required fields
  if (
    !expense ||
    !expense.name ||
    !expense.amount ||
    !expense.category
  ) {
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
  expense.description = expense.description ? validator.escape(expense.description.trim()) : null; // Sanitize notes (if provided)

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
      user: expense.user,
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
});

// Expense Delete
app.delete("/api/expenses/:expenseId", async (req, res) => {
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
});










// Get user with username while sanitizing the input
app.get("/api/users/username/:username", async (req, res) => {
  try {
    // Sanitize the username input
    const username = validator.escape(req.params.username.trim());
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid username." });
    }

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});




// Get all categories for a user while sanitizing the input
app.get("/api/:userId/categories", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const categories = await Category.find({ user: userId }).lean();
    if (!categories.length) {
      return res.status(404).json({ success: false, message: "No categories found." });
    }
     return res.json({ success: true, categories });
  }
  catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});


// Get all expenses for a user while sanitizing the input
app.get("/api/:userId/expenses", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    // Fetch expenses for the user and populate the category name
    const expenses = await Expense.find({ user: userId })
      .populate("category", "name") // Populate category name
      .sort({ date: -1 }); // Sort expenses by date in descending order

    if (expenses.length === 0) {
      return res.status(404).json({ success: false, message: "No expenses found." });
    }

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});

// Get expenses by category for a user while sanitizing the input
app.get("/api/:userId/expenses/category/:categoryId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const categoryId = req.params.categoryId;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid user or category ID." });
    }

    // Fetch expenses for the user filtered by category and populate the category name
    const expenses = await Expense.find({ user: userId, category: categoryId })
      .populate("category", "name") // Populate category name
      .sort({ date: -1 }); // Sort expenses by date in descending order

    if (expenses.length === 0) {
      return res.status(404).json({ success: false, message: "No expenses found for this category." });
    }

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});

// Get expense by ID while sanitizing the input
app.get("/api/expenses/id/:expenseId", async (req, res) => {
  try {
    const expenseId = req.params.expenseId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ success: false, message: "Invalid expense ID." });
    }

    // Fetch the expense by ID and populate the category name
    const expense = await Expense.findById(expenseId)
      .populate("category", "name"); // Populate category name

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    return res.status(200).json({ success: true, expense });
  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});


// Get category by ID while sanitizing the input
app.get("/api/categories/id/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    // Fetch the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error." });
  }
});




// Update user password while sanitizing the input
app.patch("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID." });
    }

    // Validate password
    if (
      !password ||
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[@$!%*?&]/.test(password) ||
      /\s/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long, contain an uppercase and lowercase letter, a number, and a special character.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});


// Update category while sanitizing the input
app.patch("/api/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID." });
    }

    // Create an update object with sanitized fields
    const updates = {};
    if (name) updates.name = validator.escape(name.trim());
    if (description) updates.description = validator.escape(description.trim());

    // Ensure at least one field is provided
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update." });
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    return res.json({
      success: true,
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// Update expense while sanitizing the input
app.patch("/api/expenses/:expenseId", async (req, res) => {
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
    if (name) updates.name = escape(name.trim());
    if (amount && !isNaN(amount) && amount > 0) updates.amount = amount;
    if (category) updates.category = category;
    if (description) updates.description = escape(description.trim());
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
});
