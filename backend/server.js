import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoute from "../routes/user.js";
import categoryRoute from "../routes/category.js";
import expenseRoute from "../routes/expense.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoute); // Use the user route for handling user-related requests
app.use("/api/categories", categoryRoute); // Use the category route for handling category-related requests
app.use("/api/expenses", expenseRoute); // Use the expense route for handling expense-related requests

// start the Express server
app.listen(PORT, () => {
  connectDB(); // Call the function to connect to the database
  console.log(`Server listening on port ${PORT}`);
});
