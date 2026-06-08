const axios = require("axios");
const env = require("../config/env");

const sendEmail = async ({ to, subject, body }) => {
  try {
    const response = await axios.post(
      `${env.NOTIFICATION_SERVICE_URL}/notify/email`,
      {
        to_email: to,
        subject: subject,
        content: body,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Notification email error:", error.message);
    throw new Error("Email notification failed: " + error.message);
  }
};

const sendSMS = async ({ to, message }) => {
  try {
    const response = await axios.post(
      `${env.NOTIFICATION_SERVICE_URL}/notify/sms`,
      {
        to_phone: to,
        message: message,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Notification SMS error:", error.message);
    throw new Error("SMS notification failed: " + error.message);
  }
};

const sendReminder = async () => {
  try {
    const response = await axios.post(
      `${env.NOTIFICATION_SERVICE_URL}/notify/reminder`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Notification reminder error:", error.message);
    throw new Error("Reminder notification failed: " + error.message);
  }
};

const sendMonthlyReport = async () => {
  try {
    const response = await axios.post(
      `${env.NOTIFICATION_SERVICE_URL}/notify/monthly-report`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Notification monthly report error:", error.message);
    throw new Error("Monthly report notification failed: " + error.message);
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendReminder,
  sendMonthlyReport,
};
