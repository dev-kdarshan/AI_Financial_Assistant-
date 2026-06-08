const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const NotificationLog = sequelize.define("NotificationLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("email", "sms", "reminder", "monthly-report"),
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM("email", "sms"),
    allowNull: false,
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("sent", "failed", "pending"),
    allowNull: false,
    defaultValue: "pending",
  },
  taskId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Celery task ID returned by notification service",
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["status"] },
  ],
});

module.exports = NotificationLog;