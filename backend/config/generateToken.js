import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redisClient } from "../index.js";
import { getCSRFToken, revokeCSRFToken } from "./csrfMiddleware.js";

export const generateToken = async ({ userId, res }) => {
  const sessionId = crypto.randomBytes(16).toString("hex");

  const accessToken = jwt.sign(
    { userId, sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // const csrfToken = await getCSRFToken(userId, res);

  const refreshTokenKey = `refreshToken_${userId}`;
  const activeSessionKey = `activeSession_${userId}`;
  const sessionDataKey = `session_${sessionId}`;

  const existingSessionId = await redisClient.get(activeSessionKey);
  if (existingSessionId) {
    await redisClient.del(`session_${existingSessionId}`);
    await redisClient.del(refreshTokenKey);
  }

  const sessionData = {
    userId,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  await redisClient.set(refreshTokenKey, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });
  await redisClient.set(activeSessionKey, sessionId, { EX: 7 * 24 * 60 * 60 });
  await redisClient.set(sessionDataKey, JSON.stringify(sessionData), {
    EX: 7 * 24 * 60 * 60,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { userId, sessionId } = decoded;

    const refreshTokenKey = `refreshToken_${userId}`;
    const activeSessionKey = `activeSession_${userId}`;
    const sessionDataKey = `session_${sessionId}`;

    const storedToken = await redisClient.get(refreshTokenKey);
    const activeSessionId = await redisClient.get(activeSessionKey);
    const sessionData = await redisClient.get(sessionDataKey);

    if (!storedToken || storedToken !== refreshToken) return null;
    if (!activeSessionId || activeSessionId !== sessionId) return null;
    if (!sessionData) return null;

    const parsedSession = JSON.parse(sessionData);
    parsedSession.lastActivity = new Date().toISOString();
    await redisClient.set(sessionDataKey, JSON.stringify(parsedSession), {
      EX: 7 * 24 * 60 * 60,
    });

    return decoded;
  } catch (err) {
    console.error("Refresh token verification failed:", err);
    return null;
  }
};

export const generateAccessToken = (userId, sessionId, res) => {
  const accessToken = jwt.sign(
    { userId, sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  return accessToken;
};

export const revokeRefreshToken = async (userId) => {
  try {
    const activeSessionKey = `activeSession_${userId}`;
    const refreshTokenKey = `refreshToken_${userId}`;
    const activeSessionId = await redisClient.get(activeSessionKey);

    await redisClient.del(refreshTokenKey);
    await redisClient.del(activeSessionKey);
    await revokeCSRFToken(userId);

    if (activeSessionId) {
      await redisClient.del(`session_${activeSessionId}`);
    }

    return true;
  } catch (err) {
    console.error("Error revoking refresh token:", err);
    return false;
  }
};

export const isSessionActive = async (userId, sessionId) => {
  const activeSessionKey = `activeSession_${userId}`;

  const activeSessionId = await redisClient.get(activeSessionKey);

  return activeSessionId === sessionId;
};
