const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const c = require("../controllers/itemController");

// Mounted at /api/items  (all routes need login)
router.use(protect);

router.post("/lost", upload.single("image"), c.reportLost);
router.post("/found", upload.single("image"), c.reportFound);

router.get("/lost", c.getLostItems);
router.get("/found", c.getFoundItems);
router.get("/my", c.getMyItems); // must stay above "/:id"

router.get("/:id", c.getItemById);
router.put("/:id", upload.single("image"), c.updateItem);
router.delete("/:id", c.deleteItem);
router.patch("/:id/recovered", c.markRecovered);

module.exports = router;
