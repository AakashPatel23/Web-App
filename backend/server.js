import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";

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

app.get("/finances", (req, res) => {});

//const mongoose = require("mongoose");
/*
mongoose
  .connect("mongodb://localhost/my-mern-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error(error);
  });
  */