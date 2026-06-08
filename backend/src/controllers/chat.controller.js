const { Expense, AIConversation, AIMessage, User } = require("../models/index");
const chatService = require("../services/chat.service");

// Send a message and get AI response
exports.askAI = async (req, res, next) => {
  try {
    const { question, conversationId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    // Fetch user
    const user = await User.findByPk(req.user.id);

    // Fetch user expenses from DB
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["date", "DESC"]],
    });

    // Format expenses for AI service
    const formattedExpenses = expenses.map((e) => ({
      amount: e.amount,
      category: e.category,
      datetime: e.date,
      description: e.description || "",
    }));

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({
        where: {
          id: conversationId,
          userId: req.user.id,
          deletedAt: null,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    } else {
      // Create new conversation
      conversation = await AIConversation.create({
        userId: req.user.id,
        title: question.substring(0, 60),
        context: JSON.stringify(formattedExpenses),
        messageCount: 0,
      });
    }

    // Save user message to DB
    await AIMessage.create({
      conversationId: conversation.id,
      userId: req.user.id,
      role: "user",
      content: question,
    });

    // Call AI service
    const aiResponse = await chatService.askAI(
      req.user.id,
      question,
      expenses
    );

    const answer = aiResponse.response;

    // Save assistant reply to DB
    await AIMessage.create({
      conversationId: conversation.id,
      userId: req.user.id,
      role: "assistant",
      content: answer,
    });

    // Update message count on conversation
    await conversation.update({
      messageCount: conversation.messageCount + 2,
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        question,
        answer,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all conversations for user
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["updatedAt", "DESC"]],
      attributes: ["id", "title", "messageCount", "createdAt", "updatedAt"],
    });

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

// Get all messages for a conversation
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({
      where: {
        id: req.params.conversationId,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await AIMessage.findAll({
      where: {
        conversationId: req.params.conversationId,
      },
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};