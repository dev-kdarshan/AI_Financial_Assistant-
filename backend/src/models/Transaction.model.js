const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define("Transaction", {
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
  type: {
    type: DataTypes.ENUM("debit", "credit"),
    allowNull: true,
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  source: {
    type: DataTypes.ENUM("gpay", "manual"),
    allowNull: false,
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
    { fields: ["userId", "date"] },
    { fields: ["deletedAt"] },
  ],
});

module.exports = Transaction;