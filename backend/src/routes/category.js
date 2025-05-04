import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  getAllCategoriesWithExpenses
} from "../controllers/category.js"; // Assuming you have a createCategory function in your controllers
const router = express.Router();

export default router;

// Category Create
router.post("/", createCategory);

// Category Delete
router.delete("/:categoryId", deleteCategory);

// Get all categories while sanitizing the input
router.get("/", getAllCategories);

// Get category by ID while sanitizing the input
router.get("/id/:categoryId", getCategoryById);

// Update category while sanitizing the input
router.patch("/:categoryId", updateCategory);

// In your router file
router.get("/with-expenses", getAllCategoriesWithExpenses);
