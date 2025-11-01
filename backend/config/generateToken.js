import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";

export const generateToken = async ({ userId, res }) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refreshToken_${userId}`;

  await redisClient.set(refreshTokenKey, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    // secure: true,
  });

  return { accessToken, refreshToken };
};
