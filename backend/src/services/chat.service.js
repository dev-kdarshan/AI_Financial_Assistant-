const axios = require("axios");
const env = require("../config/env");

const askAI = async (userId, question, expenses) => {
  try {
    const response = await axios.post(
      `${env.AI_SERVICE_URL}/ai/ask`,
      {
        user_id: userId,
        question,
        expenses: expenses.map((e) => ({
          amount: e.amount,
          category: e.category,
          datetime: e.date,
          description: e.description || "",
        })),
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("AI service error:", error.message);
    throw new Error("AI service failed: " + error.message);
  }
};

module.exports = { askAI };