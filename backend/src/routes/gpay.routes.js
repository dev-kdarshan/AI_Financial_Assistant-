const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/gpay.controller");

// Use memory storage so we pass buffer directly to service
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import", auth, upload.single("file"), controller.importGpay);

module.exports = router;