const { NotificationLog, User } = require("../models/index");
const notificationService = require("../services/notification.service");

exports.sendNotification = async (req, res, next) => {
  try {
    const { type, channel, subject, message } = req.body;

    if (!type || !channel) {
      return res.status(400).json({
        success: false,
        message: "type and channel are required",
      });
    }

    // Fetch user to get email and phone
    const user = await User.findByPk(req.user.id);

    const recipient = channel === "email" ? user.email : user.phone;

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: `User has no ${channel} on file`,
      });
    }

    // Create log entry with pending status
    const log = await NotificationLog.create({
      userId: req.user.id,
      type,
      channel,
      recipient,
      subject: subject || null,
      status: "pending",
      taskId: null,
    });

    // Call correct notification service endpoint
    let serviceResult;
    try {
      if (channel === "email") {
        serviceResult = await notificationService.sendEmail({
          to: recipient,
          subject: subject || "AIFA Notification",
          body: message,
        });
      } else if (channel === "sms") {
        serviceResult = await notificationService.sendSMS({
          to: recipient,
          message,
        });
      }

      // Update log to sent
      await log.update({
        status: "sent",
        taskId: serviceResult?.task_id || null,
      });

      res.json({
        success: true,
        message: "Notification sent successfully",
        data: {
          logId: log.id,
          taskId: serviceResult?.task_id || null,
          status: "sent",
        },
      });
    } catch (serviceError) {
      // Update log to failed if service call fails
      await log.update({ status: "failed" });

      return res.status(502).json({
        success: false,
        message: "Notification service failed",
        error: serviceError.message,
      });
    }
  } catch (err) {
    next(err);
  }
};

// Get notification logs for user
exports.getNotificationLogs = async (req, res, next) => {
  try {
    const logs = await NotificationLog.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};