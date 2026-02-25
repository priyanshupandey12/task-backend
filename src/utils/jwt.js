const jwt = require("jsonwebtoken");


const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};


const sendTokenCookie = (res, user, statusCode, message) => {
  const isProduction = process.env.NODE_ENV === "production";
  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,   
    secure: isProduction, 
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };

  res.cookie("token", token, cookieOptions);

  const { password, ...userData } = user.toObject ? user.toObject() : user;

  res.status(statusCode).json({
    success: true,
    message,
    user: userData,
  });
};

module.exports = { signToken, sendTokenCookie };