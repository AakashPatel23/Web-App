import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import categoryRoute from "./routes/category.js";
import expenseRoute from "./routes/expense.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/categories", categoryRoute); // Use the category route for handling category-related requests
app.use("/expenses", expenseRoute); // Use the expense route for handling expense-related requests

// start the Express server
app.listen(PORT, () => {
  connectDB(); // Call the function to connect to the database
  console.log(`Server listening on port ${PORT}`);
});
