const axios = require("axios");

const REPORT_SERVICE_URL =
  "http://localhost:8006";


const generateFinancialReport = async (
  reportData
) => {

  try {

    const response = await axios.post(
      `${REPORT_SERVICE_URL}/generate-report`,
      reportData
    );

    return response.data;

  } catch (error) {

    console.error(
      "Report Service Error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  generateFinancialReport
};