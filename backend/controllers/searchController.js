const Item = require("../models/Item");
const { TYPES, STATUSES, CATEGORIES } = Item;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Shared search. `forced` lets a route lock a value (e.g. status=recovered).
const run = (forced = {}) => async (req, res) => {
  try {
    const q = { ...req.query, ...forced };
    const page = Math.max(parseInt(q.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 50);

    const filter = { status: { $ne: "removed" } };

    if (q.type) {
      if (!TYPES.includes(q.type)) return res.status(400).json({ message: "Invalid type" });
      filter.type = q.type;
    }
    if (q.category) {
      if (!CATEGORIES.includes(q.category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = q.category;
    }
    if (q.status) {
      if (!STATUSES.includes(q.status) || q.status === "removed") {
        return res.status(400).json({ message: "Invalid status" });
      }
      filter.status = q.status;
    }
    if (q.q && q.q.trim()) {
      const rx = new RegExp(escapeRegex(q.q.trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }
    if (q.location && q.location.trim()) {
      filter.location = new RegExp(escapeRegex(q.location.trim()), "i");
    }
    if (q.from || q.to) {
      filter.date = {};
      if (q.from) {
        const d = new Date(q.from);
        if (isNaN(d)) return res.status(400).json({ message: "Invalid 'from' date" });
        filter.date.$gte = d;
      }
      if (q.to) {
        const d = new Date(q.to);
        if (isNaN(d)) return res.status(400).json({ message: "Invalid 'to' date" });
        filter.date.$lte = d;
      }
    }

    const sort = q.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
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

exports.searchItems = run();
exports.getRecovered = run({ status: "recovered" });

// Values for the frontend's filter dropdowns
exports.getMeta = (req, res) => {
  res.json({
    types: TYPES,
    categories: CATEGORIES,
    statuses: STATUSES.filter((s) => s !== "removed"),
  });
};
