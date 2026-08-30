require("dotenv").config();

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "OCR_SERVICE_URL",
  "GPAY_SERVICE_URL",
  "AI_SERVICE_URL",
  "ANALYTICS_SERVICE_URL",
  "NOTIFICATION_SERVICE_URL",
  "REPORT_SERVICE_URL",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `${key} is missing in environment configuration`
    );
  }
}

const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV:
    process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DIALECT:
    process.env.DB_DIALECT || "postgres",

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",

  BCRYPT_ROUNDS:
    parseInt(
      process.env.BCRYPT_ROUNDS,
      10
    ) || 10,

  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID,

  GOOGLE_CLIENT_SECRET:
    process.env.GOOGLE_CLIENT_SECRET,

  OCR_SERVICE_URL:
    process.env.OCR_SERVICE_URL,

  GPAY_SERVICE_URL:
    process.env.GPAY_SERVICE_URL,

  AI_SERVICE_URL:
    process.env.AI_SERVICE_URL,

  ANALYTICS_SERVICE_URL:
    process.env.ANALYTICS_SERVICE_URL,

  NOTIFICATION_SERVICE_URL:
    process.env.NOTIFICATION_SERVICE_URL,

  REPORT_SERVICE_URL:
    process.env.REPORT_SERVICE_URL,
};

module.exports = env;