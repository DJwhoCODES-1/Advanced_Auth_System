import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { generateCSRFToken, revokeCSRFToken } from "./csrfMiddleware.js";

export const generateToken = async ({ userId, res }) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const csrfToken = await generateCSRFToken(userId, res);

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

  return { accessToken, refreshToken, csrfToken };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const refreshTokenKey = `refreshToken_${decode.userId}`;

    const storedToken = await redisClient.get(refreshTokenKey);

    if (storedToken == refreshToken) {
      return decode;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateAccessToken = (id, res) => {
  const accessToken = jwt.sign({ userId: id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });
};

export const revokeRefreshToken = async (userId) => {
  try {
    const refreshTokenKey = `refreshToken_${userId}`;
    await redisClient.del(refreshTokenKey);
    await revokeCSRFToken(userId);
  } catch (error) {
    console.log(error);
    return null;
  }
};
