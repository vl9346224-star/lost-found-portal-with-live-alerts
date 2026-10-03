const Item = require("../models/Item");
const User = require("../models/User");
const { STATUSES, TYPES, CATEGORIES } = Item;
const { removeImageFile } = require("../utils/files");
const { notifyUser } = require("../utils/notify");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pageParams = (q) => {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 20, 1), 100);
  return { page, limit };
};

// View all reports (including removed ones)
exports.getAllReports = async (req, res) => {
  try {
    const { page, limit } = pageParams(req.query);
    const filter = {};
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      filter.status = req.query.status;
    }
    if (req.query.type) {
      if (!TYPES.includes(req.query.type)) return res.status(400).json({ message: "Invalid type" });
      filter.type = req.query.type;
    }
    if (req.query.category) {
      if (!CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = req.query.category;
    }
    if (req.query.q && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("reportedBy", "name email"),
      Item.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const count = (f) => Item.countDocuments(f);
    const [total, pending, verified, recovered, removed, lost, found, users] = await Promise.all([
      count({}),
      count({ status: "pending" }),
      count({ status: "verified" }),
      count({ status: "recovered" }),
      count({ status: "removed" }),
      count({ type: "lost" }),
      count({ type: "found" }),
      User.countDocuments({}),
    ]);
    res.json({ total, byStatus: { pending, verified, recovered, removed }, byType: { lost, found }, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify a report
exports.verifyItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.status === "removed") {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.status === "verified") {
      return res.status(400).json({ message: "Item is already verified" });
    }
    if (item.status === "recovered") {
      return res.status(400).json({ message: "Recovered items cannot be verified" });
    }
    item.status = "verified";
    item.verifiedBy = req.user.id;
    item.verifiedAt = new Date();
    await item.save();

    await notifyUser(req.app, item.reportedBy, {
      type: "verified",
      message: `Your report "${item.title}" was verified by an admin.`,
      item: item._id,
    });
    const io = req.app.get("io");
    if (io) io.emit("itemStatusChanged", { id: item._id, status: item.status });

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};

// Update item status (pending | verified | recovered | removed)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
    }
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = status;
    if (status === "recovered") item.recoveredAt = new Date();
    else item.recoveredAt = undefined;
    if (status === "verified") {
      item.verifiedBy = req.user.id;
      item.verifiedAt = new Date();
    }
    await item.save();

    await notifyUser(req.app, item.reportedBy, {
      type: "status_changed",
      message: `The status of your report "${item.title}" was changed to "${status}" by an admin.`,
      item: item._id,
    });
    const io = req.app.get("io");
    if (io) io.emit("itemStatusChanged", { id: item._id, status: item.status });

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};

// Remove an inappropriate report. Soft by default (status "removed");
// add ?hard=true to delete it from the database completely.
exports.removeItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const reason = (req.body && req.body.reason) || "Removed by admin";

    await notifyUser(req.app, item.reportedBy, {
      type: "removed",
      message: `Your report "${item.title}" was removed by an admin. Reason: ${reason}`,
      item: item._id,
    });

    if (req.query.hard === "true") {
      removeImageFile(item.imageUrl);
      await item.deleteOne();
    } else {
      item.status = "removed";
      item.removedReason = reason;
      await item.save();
    }

    const io = req.app.get("io");
    if (io) io.emit("itemRemoved", { id: item._id });

    res.json({ message: req.query.hard === "true" ? "Report deleted permanently" : "Report removed" });
  } catch (err) {
    res.status(400).json({ message: "Invalid item id" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, limit } = pageParams(req.query);
    const [users, total] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments({}),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
