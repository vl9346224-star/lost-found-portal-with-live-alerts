const fs = require("fs");
const path = require("path");
const Item = require("../models/Item");

const isOwnerOrAdmin = (item, user) =>
  item.reportedBy.toString() === user.id || user.role === "admin";

const removeImageFile = (imageUrl) => {
  if (!imageUrl) return;
  const filePath = path.join(__dirname, "..", imageUrl);
  fs.unlink(filePath, () => {}); // ignore errors
};

// Shared create logic for lost + found
const createItem = (type) => async (req, res) => {
  try {
    const { title, description, category, location, date, contactInfo } = req.body;

    if (!title || !description || !category || !location || !date || !contactInfo) {
      if (req.file) removeImageFile("/uploads/" + req.file.filename);
      return res.status(400).json({ message: "All fields are required" });
    }

    const item = await Item.create({
      title,
      description,
      category,
      location,
      date,
      contactInfo,
      type,
      reportedBy: req.user.id,
      imageUrl: req.file ? "/uploads/" + req.file.filename : "",
    });

    // HOOK for Member 7 (live alerts): emits only if Socket.IO is set up
    const io = req.app.get("io");
    if (io) io.emit("newItem", item);

    res.status(201).json(item);
  } catch (err) {
    if (req.file) removeImageFile("/uploads/" + req.file.filename);
    res.status(400).json({ message: err.message });
  }
};

exports.reportLost = createItem("lost");
exports.reportFound = createItem("found");

// Shared list logic. Basic list only - search/filter is Member 6's job.
const listItems = (type) => async (req, res) => {
  try {
    const items = await Item.find({ type, status: { $ne: "removed" } })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLostItems = listItems("lost");
exports.getFoundItems = listItems("found");

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name email");
    if (!item || item.status === "removed") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user.id, status: { $ne: "removed" } }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.status === "removed") {
      if (req.file) removeImageFile("/uploads/" + req.file.filename);
      return res.status(404).json({ message: "Item not found" });
    }
    if (!isOwnerOrAdmin(item, req.user)) {
      if (req.file) removeImageFile("/uploads/" + req.file.filename);
      return res.status(403).json({ message: "Not allowed to edit this report" });
    }

    // Only these fields can be edited (status/type/reportedBy are protected)
    const editable = ["title", "description", "category", "location", "date", "contactInfo"];
    editable.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    if (req.file) {
      removeImageFile(item.imageUrl);
      item.imageUrl = "/uploads/" + req.file.filename;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    if (req.file) removeImageFile("/uploads/" + req.file.filename);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!isOwnerOrAdmin(item, req.user)) {
      return res.status(403).json({ message: "Not allowed to delete this report" });
    }
    removeImageFile(item.imageUrl);
    await item.deleteOne();
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};

exports.markRecovered = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.status === "removed") {
      return res.status(404).json({ message: "Item not found" });
    }
    if (!isOwnerOrAdmin(item, req.user)) {
      return res.status(403).json({ message: "Not allowed to update this report" });
    }
    if (item.status === "recovered") {
      return res.status(400).json({ message: "Item is already marked as recovered" });
    }
    item.status = "recovered";
    item.recoveredAt = new Date();
    await item.save();

    const io = req.app.get("io");
    if (io) io.emit("itemRecovered", item);

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};
