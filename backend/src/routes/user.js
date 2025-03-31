import express from "express";
import {
  createUser,
  deleteUser,
  getUserByUsername,
  updatePassword,
} from "../controllers/user.js";

const router = express.Router();

export default router;

//User Create
router.post("/", createUser);

// User Delete
router.delete("/:userId", deleteUser);

// Get user with username while sanitizing the input
router.get("/username/:username", getUserByUsername);

// Update user password while sanitizing the input
router.patch("/:userId", updatePassword);
