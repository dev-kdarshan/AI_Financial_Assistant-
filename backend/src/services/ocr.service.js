const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");

const extractFromSlip = async (fileBuffer, originalName, mimetype) => {
  try {
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: originalName,
      contentType: mimetype,
    });

    const response = await axios.post(
      `${env.OCR_SERVICE_URL}/ocr/extract`,
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
    console.error("OCR service error:", error.message);
    throw new Error("OCR service failed: " + error.message);
  }
};

module.exports = { extractFromSlip };
