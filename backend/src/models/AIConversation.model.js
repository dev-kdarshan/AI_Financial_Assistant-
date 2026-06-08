const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AIConversation = sequelize.define("AIConversation", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "JSON snapshot of user expenses at time of conversation",
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["deletedAt"] },
  ],
});

module.exports = AIConversation;