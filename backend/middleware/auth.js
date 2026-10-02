// TEMPORARY STUB - Member 4 will replace this with real JWT verification.
// Contract: after this middleware runs, req.user = { id, role } must exist.
const protect = (req, res, next) => {
  req.user = { id: "64b000000000000000000001", role: "student" };
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };
