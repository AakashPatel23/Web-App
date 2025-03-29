import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId, // user_id as the primary key
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password should be stored
  },
  { collection: "users", 
    timestamps: true } // This will add createdAt and updatedAt fields to the schema
);

export default mongoose.model("User", UserSchema);
