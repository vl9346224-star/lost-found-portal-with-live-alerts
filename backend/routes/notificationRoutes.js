const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/notificationController");

// Mounted at /api/notifications
router.use(protect);

router.get("/", c.getMyNotifications);
router.patch("/read-all", c.markAllRead); // must stay above "/:id/read"
router.patch("/:id/read", c.markRead);

module.exports = router;
