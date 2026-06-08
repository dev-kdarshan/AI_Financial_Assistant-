const axios = require("axios");
const env = require("../config/env");

const analyzeExpenses = async (expenses) => {
  try {
    const payload = {
      expenses: expenses.map((e) => ({
        amount: e.amount,
        category: e.category,
        datetime: e.date,
        description: e.description || "",
      })),
    };

    const response = await axios.post(
      `${env.ANALYTICS_SERVICE_URL}/analytics/analyze`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Analytics service error:", error.message);
    throw new Error("Analytics service failed: " + error.message);
  }
};

module.exports = { analyzeExpenses };