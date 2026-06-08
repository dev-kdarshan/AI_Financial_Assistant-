const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AIMessage = sequelize.define("AIMessage", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "assistant"),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contextUsed: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Which expense chunks the RAG pipeline used to answer",
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["conversationId"] },
    { fields: ["userId"] },
  ],
});

module.exports = AIMessage;