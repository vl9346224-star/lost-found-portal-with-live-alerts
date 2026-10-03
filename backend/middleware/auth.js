const jwt = require("jsonwebtoken");
const User = require("../models/User");

// After this runs: req.user = { id, role, name }
const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in" });
  }
  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("_id role name");
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    req.user = { id: user._id.toString(), role: user.role, name: user.name };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };
