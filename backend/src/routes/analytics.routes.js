const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/analytics.controller");

router.get("/", auth, controller.getAnalytics);

module.exports = router;