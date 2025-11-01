import { registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import sanitize from "mongo-sanitize";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../helper/htmlTemplate.helper.js";

export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const raw = validation.error;
    const parsed = JSON.parse(raw.message);
    let errors = [];
    if (parsed) {
      errors = parsed.map((err) => ({
        path: err.path[0],
        message: err.message || "Invalid input",
        code: err.code,
      }));
    }

    return res.status(400).json({
      message: "validation error",
      errors,
    });
  }

  const { name, email, password } = validation.data;

  const rateLimitKey = `registerRateLimit_${req.ip}_${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res
      .status(429)
      .json({ message: "Too many requests, try again later!" });
  }

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists!",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const redisPayload = JSON.stringify({
    name,
    email,
    password: hashPassword,
  });

  await redisClient.set(verifyKey, redisPayload, { EX: 300 });

  const subject = "verify your email for account creation";

  const html = getVerifyEmailHtml({ email, verifyToken });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message:
      "Verification code has been sent to to your mail. Valid for 5 mins!",
  });
});
