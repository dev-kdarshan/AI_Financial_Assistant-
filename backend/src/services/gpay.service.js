const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");

const parseGpayFile = async (fileBuffer, originalName) => {
  try {
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: originalName,
      contentType: "text/html",
    });

    const response = await axios.post(
      `${env.GPAY_SERVICE_URL}/gpay/parse`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("GPay service error:", error.message);
    throw new Error("GPay service failed: " + error.message);
  }
};

module.exports = { parseGpayFile };