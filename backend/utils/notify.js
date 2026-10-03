const Notification = require("../models/Notification");

// Saves a notification in the DB and pushes it live to that user's socket room
exports.notifyUser = async (app, userId, { type, message, item }) => {
  const n = await Notification.create({ user: userId, type, message, item });
  const io = app.get("io");
  if (io) io.to(`user:${userId}`).emit("notification", n);
  return n;
};
