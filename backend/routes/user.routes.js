import express from "express";
import {
  myProfile,
  registerUser,
  userLogin,
  verifyOtp,
  verifyUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);
router.post("/login", userLogin);
router.post("/verify-otp", verifyOtp);
router.get("/profile", isAuth, myProfile);

export default router;
