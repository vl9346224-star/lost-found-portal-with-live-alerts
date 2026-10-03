const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const [notifications, unread] = await Promise.all([
      Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.json({ unread, notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: "Notification not found" });
    res.json(n);
  } catch (err) {
    res.status(400).json({ message: "Invalid notification id" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
