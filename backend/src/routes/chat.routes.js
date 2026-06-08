const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/chat.controller");

router.post("/ask", auth, controller.askAI);
router.get("/conversations", auth, controller.getConversations);
router.get("/conversations/:conversationId/messages", auth, controller.getMessages);

module.exports = router;