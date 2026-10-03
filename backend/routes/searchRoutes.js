const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/searchController");

// Mounted at /api/search  (login required)
router.use(protect);

router.get("/meta", c.getMeta); // filter dropdown values
router.get("/recovered", c.getRecovered); // recovered items
router.get("/", c.searchItems); // ?q=&type=&category=&status=&location=&from=&to=&page=&limit=&sort=

module.exports = router;
