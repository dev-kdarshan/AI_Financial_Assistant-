const sequelize = require("../config/db");

const User            = require("./User.model");
const Expense         = require("./Expense.model");
const Transaction     = require("./Transaction.model");
const AIConversation  = require("./AIConversation.model");
const AIMessage       = require("./AIMessage.model");
const NotificationLog = require("./NotificationLog.model");

// ─────────────────────────────────────────
// User associations
// ─────────────────────────────────────────
User.hasMany(Expense, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Expense.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Transaction, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Transaction.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(AIConversation, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
AIConversation.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(AIMessage, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
AIMessage.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(NotificationLog, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
NotificationLog.belongsTo(User, {
  foreignKey: "userId",
});

// ─────────────────────────────────────────
// AIConversation → AIMessage
// ─────────────────────────────────────────
AIConversation.hasMany(AIMessage, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});
AIMessage.belongsTo(AIConversation, {
  foreignKey: "conversationId",
});

// ─────────────────────────────────────────
// Transaction → Expense (optional link)
// ─────────────────────────────────────────
Transaction.hasMany(Expense, {
  foreignKey: "transactionId",
  onDelete: "SET NULL",
});
Expense.belongsTo(Transaction, {
  foreignKey: "transactionId",
});

// ─────────────────────────────────────────
// Sync — alter: true updates columns safely
// after migration has already run
// ─────────────────────────────────────────
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Expense,
  Transaction,
  AIConversation,
  AIMessage,
  NotificationLog,
};