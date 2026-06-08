const jwt = require("jsonwebtoken");
const env = require("../config/env");


// Generate Token
const generateToken = (payload) => {
  if (!payload) {
    throw new Error("Payload is required");
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify Token
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment");
  }

  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};