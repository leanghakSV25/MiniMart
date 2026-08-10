const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/productController");

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getOne);
router.post("/", auth, controller.create);
router.put("/:id", auth, controller.update);
router.delete("/:id", auth, controller.remove);

module.exports = router;
