import express from "express";
import {
  registerUser,
  userLogin,
  verifyOtp,
  verifyUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);
router.post("/login", userLogin);
router.post("/verify-otp", verifyOtp);

export default router;
