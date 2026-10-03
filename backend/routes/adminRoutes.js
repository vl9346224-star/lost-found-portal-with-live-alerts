const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const c = require("../controllers/adminController");

// Mounted at /api/admin  (admin only)
router.use(protect, adminOnly);

router.get("/stats", c.getStats);
router.get("/reports", c.getAllReports);
router.patch("/reports/:id/verify", c.verifyItem);
router.patch("/reports/:id/status", c.updateStatus);
router.delete("/reports/:id", c.removeItem); // ?hard=true for permanent delete
router.get("/users", c.getUsers);

module.exports = router;
