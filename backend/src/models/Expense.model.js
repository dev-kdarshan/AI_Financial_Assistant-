const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define("Expense", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  merchantName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slipUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM("ocr", "gpay", "manual"),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isAiSuggested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["date"] },
    { fields: ["category"] },
    { fields: ["userId", "date"] },
    { fields: ["deletedAt"] },
    { fields: ["source"] },
  ],
});

module.exports = Expense;