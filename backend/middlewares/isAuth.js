import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { UserModel } from "../models/user.model.js";
import { isSessionActive } from "../config/generateToken.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(400).json({
        message: "Please Login - no token",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!decodedData) {
      return res.status(400).json({
        message: "token expired!",
      });
    }

    const sessionActive = isSessionActive(
      decodedData.userId,
      decodedData.sessionId
    );

    if (!sessionActive) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrf_seed");

      return res.status(401).json({
        message:
          "Session Expired! You have been logged in from another device!",
      });
    }

    const cachedUserData = await redisClient.get(`user_${decodedData.userId}`);

    if (cachedUserData) {
      req.user = JSON.parse(cachedUserData);
      req.sessionId = decodedData.sessionId;
      return next();
    }

    const user = await UserModel.findById(decodedData.userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(400).json({
        message: "user not found!",
      });
    }

    await redisClient.set(`user_${decodedData.userId}`, JSON.stringify(user), {
      EX: 15 * 60,
    });

    req.user = user;
    req.sessionId = decodedData.sessionId;

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
