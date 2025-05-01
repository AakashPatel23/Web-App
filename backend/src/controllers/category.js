import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import validator from "validator";
import mongoose from "mongoose";

export const createCategory = async (req, res) => {
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
  
const existingCategory = await Category.findOne({ name: category.name });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists. Please choose a different one.",
      });
    }

    // Create the new category object
    const newCategory = new Category({
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
};

export const deleteCategory = async (req, res) => {
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
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    if (!categories.length) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found." });
    }
    return res.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID." });
    }

    // Fetch the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateCategory = async (req, res) => {
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
};
