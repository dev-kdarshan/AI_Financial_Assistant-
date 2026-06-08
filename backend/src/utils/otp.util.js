// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

// Generate OTP
const generateOTP = (identifier) => {
  if (!identifier) {
    throw new Error("Identifier is required");
  }

  const otp = Math.floor(
    Math.pow(10, OTP_LENGTH - 1) +
    Math.random() * 9 * Math.pow(10, OTP_LENGTH - 1)
  ).toString();

  const expiry = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(identifier, {
    otp,
    expiry,
  });

  return otp;
};

// Verify OTP
const verifyOTP = (identifier, enteredOTP) => {
  if (!identifier || !enteredOTP) {
    return false;
  }

  const record = otpStore.get(identifier);

  if (!record) {
    return false;
  }

  const { otp, expiry } = record;

  // Expired
  if (Date.now() > expiry) {
    otpStore.delete(identifier);
    return false;
  }

  // Mismatch
  if (otp !== enteredOTP) {
    return false;
  }

  // Success (one-time use)
  otpStore.delete(identifier);
  return true;
};

module.exports = {
  generateOTP,
  verifyOTP,
};