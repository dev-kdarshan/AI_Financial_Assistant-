const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/expense.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", auth, controller.addExpense);
router.post("/ocr", auth, upload.single("slip"), controller.addExpenseFromOCR);
router.put("/:id", auth, controller.updateExpense);
router.get("/", auth, controller.getExpenses);
router.get("/:id", auth, controller.getExpenseById);
router.delete("/:id", auth, controller.softDeleteExpense);

module.exports = router;
