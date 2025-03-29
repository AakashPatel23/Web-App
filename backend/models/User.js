import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId, // user_id as the primary key
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password should be stored
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", UserSchema);
