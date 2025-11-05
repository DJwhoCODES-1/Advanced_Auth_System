import express from "express";
import {
  logoutUser,
  myProfile,
  refreshCSRF,
  refreshToken,
  registerUser,
  userLogin,
  verifyOtp,
  verifyUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);
router.post("/login", userLogin);
router.post("/verify-otp", verifyOtp);
router.get("/profile", isAuth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", isAuth, verifyCSRFToken, logoutUser);
router.post("/refresh-csrf", isAuth, refreshCSRF);

export default router;
