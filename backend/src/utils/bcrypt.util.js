const bcrypt = require("bcryptjs");
const env = require("../config/env");

const SALT_ROUNDS = parseInt(env.BCRYPT_ROUNDS, 10) || 10;

// Hash Password
const hashPassword = async (plainPassword) => {
  if (!plainPassword) {
    throw new Error("Password is required");
  }

  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// Compare Password
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};