const mongoose = require("mongoose");
require("./User");

// Shared values - agreed with the team (see README)
const TYPES = ["lost", "found"];
const STATUSES = ["pending", "verified", "recovered", "removed"];
const CATEGORIES = ["id_card", "phone", "wallet", "books", "calculator", "bag", "other"];

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, enum: CATEGORIES, required: true },
    type: { type: String, enum: TYPES, required: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true }, // date lost / found
    imageUrl: { type: String, default: "" },
    contactInfo: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: "pending" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recoveredAt: { type: Date },
  },
  { timestamps: true }
);

// Helps Member 6's search
itemSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Item", itemSchema);
module.exports.TYPES = TYPES;
module.exports.STATUSES = STATUSES;
module.exports.CATEGORIES = CATEGORIES;
