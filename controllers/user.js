import User from "../backend/models/User.js";
import Category from "../backend/models/Category.js";
import Expense from "../backend/models/Expense.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
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
};


export const deleteUser = async (req, res) => {
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
};

export const getUserByUsername = async (req, res) => {
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
};

export const updatePassword = async (req, res) => {
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
};