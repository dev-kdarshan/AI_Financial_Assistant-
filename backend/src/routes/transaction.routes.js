const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/transaction.controller");

router.post("/", auth, controller.addTransaction);
router.get("/", auth, controller.getTransactions);
router.get("/range", auth, controller.getTransactionsByDate);
router.delete("/:id", auth, controller.softDeleteTransaction);

module.exports = router;