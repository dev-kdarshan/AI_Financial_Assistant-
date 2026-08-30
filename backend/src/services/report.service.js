const axios = require("axios");
const env = require("../config/env");

const generateFinancialReport = async (reportData) => {
  try {
    const response = await axios.post(
      `${env.REPORT_SERVICE_URL}/generate-report`,
      reportData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Report Service Error:",
      error.message
    );

    throw new Error(
      "Report service failed: " + error.message
    );
  }
};

module.exports = {
  generateFinancialReport,
};