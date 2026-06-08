const User = require("../models/User.model");
const { hashPassword, comparePassword } = require("../utils/bcrypt.util");
const { generateToken } = require("../utils/jwt.util");
const { generateOTP, verifyOTP } = require("../utils/otp.util");


// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const otp = generateOTP(email);

    return res.status(201).json({
      message: "User registered. Verify OTP.",
      otp, // for dev only
    });
  } catch (err) {
    next(err);
  }
};


// Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const isValid = verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.update(
      { isVerified: true },
      { where: { email } }
    );

    return res.json({ message: "Account verified successfully" });
  } catch (err) {
    next(err);
  }
};


// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    next(err);
  }
};


// Google Login (basic)
exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
      });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.json({
      message: "Google login successful",
      token,
    });
  } catch (err) {
    next(err);
  }
};