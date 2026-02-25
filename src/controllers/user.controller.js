const User = require("../models/user.model");
const { sendTokenCookie } = require("../utils/jwt");


const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

      if([name, email, password].some(field => !field || field.trim() === "")) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password });

    sendTokenCookie(res, user, 201, "Account created successfully!");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

        if([email, password].some(field => !field || field.trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    sendTokenCookie(res, user, 200, "Logged in successfully!");
  } catch (error) {
    next(error);
  }
};


const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), 
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};


const getMe = async (req, res) => {

  res.status(200).json({ success: true, user: req.user });
};

module.exports = { register, login, logout, getMe };