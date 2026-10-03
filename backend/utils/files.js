const fs = require("fs");
const path = require("path");

// Deletes an uploaded image (imageUrl looks like "/uploads/123.jpg")
exports.removeImageFile = (imageUrl) => {
  if (!imageUrl) return;
  fs.unlink(path.join(__dirname, "..", imageUrl), () => {}); // ignore errors
};
