const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/authController");

// Mounted at /api/auth
router.post("/register", c.register);
router.post("/login", c.login);
router.get("/me", protect, c.getMe);
router.put("/me", protect, c.updateMe);

module.exports = router;
