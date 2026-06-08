const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

module.exports = router;