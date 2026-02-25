const express = require("express");
const router = express.Router();

const { register, login, logout, getMe } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate, registerSchema, loginSchema } = require("../utils/validators");


router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);


router.get("/me", protect, getMe);

module.exports = router;