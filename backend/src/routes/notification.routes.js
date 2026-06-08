const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/notification.controller");

router.post("/send", auth, controller.sendNotification);
router.get("/logs", auth, controller.getNotificationLogs);

module.exports = router;