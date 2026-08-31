const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/report.controller");

router.post("/generate", auth, controller.generateReport);

router.get(
  "/download/:filename",
  auth,
  controller.downloadReport
);

module.exports = router;
