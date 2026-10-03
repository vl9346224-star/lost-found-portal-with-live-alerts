// TEMPORARY STUB - Member 4 will replace this with the real User model.
// Keep the model name "User" so other models can reference it.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
