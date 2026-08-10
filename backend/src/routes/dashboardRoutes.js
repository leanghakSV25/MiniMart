const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/dashboardController");

router.get("/summary", auth, controller.summary);

module.exports = router;
