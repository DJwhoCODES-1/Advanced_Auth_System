import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";

const SERVER_CSRF_SECRET = process.env.CSRF_SECRET || "super-secret-csrf-key";

export const generateCSRFSeed = async (userId, res) => {
  const seed = crypto.randomBytes(24).toString("hex");
  await redisClient.set(`csrf_seed_${userId}`, seed, { EX: 300 });
  res.cookie("csrf_seed", seed, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 5 * 60 * 1000,
  });
};

export const getCSRFToken = async (req, res) => {
  try {
    const userId = req.user?._id;
    const seed = req.cookies?.csrf_seed;

    if (!userId || !seed)
      return res
        .status(401)
        .json({ message: "CSRF seed missing or expired. Please login again." });

    const stored = await redisClient.get(`csrf_seed_${userId}`);
    if (!stored || stored !== seed) {
      return res.status(403).json({ message: "Invalid CSRF seed." });
    }

    const csrfToken = jwt.sign({ uid: userId }, SERVER_CSRF_SECRET, {
      expiresIn: "15m",
    });

    await redisClient.del(`csrf_seed_${userId}`);
    res.clearCookie("csrf_seed");

    res.status(200).json({
      message: "CSRF token issued successfully!",
      csrfToken,
    });
  } catch (err) {
    console.error("getCSRFToken error:", err);
    res.status(500).json({ message: "Failed to generate CSRF token." });
  }
};

export const verifyCSRFToken = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const allowedOrigin = "https://your-frontend.com";
  const requestOrigin = req.headers.origin;

  if (requestOrigin !== allowedOrigin) {
    return res
      .status(403)
      .json({ message: "Invalid request origin. Access denied." });
  }

  const token =
    req.headers["x-csrf-token"] ||
    req.headers["csrf-token"] ||
    req.headers["x-xsrf-token"];

  if (!token)
    return res.status(403).json({ message: "CSRF token missing in headers." });

  try {
    const decoded = jwt.verify(token, SERVER_CSRF_SECRET);
    req.csrf = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired CSRF token." });
  }
};
