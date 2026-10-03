const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["possible_match", "verified", "status_changed", "removed", "info"],
      default: "info",
    },
    message: { type: String, required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
