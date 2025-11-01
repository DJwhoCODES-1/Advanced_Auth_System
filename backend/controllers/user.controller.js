import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import sanitize from "mongo-sanitize";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import {
  getVerifyEmailHtml,
  htmlTemplate,
} from "../helper/htmlTemplate.helper.js";
import { generateToken } from "../config/generateToken.js";

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

export const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(404).json({
      message: "Verification token is required!",
    });
  }

  const verifyKey = `verify:${token}`;

  const userDataJson = await redisClient.get(verifyKey);

  if (!userDataJson) {
    return res.status(404).json({
      message: "Verification link is expired!",
    });
  }

  await redisClient.del(verifyKey);

  const userData = JSON.parse(userDataJson);

  const existingUser = await UserModel.findOne({ email: userData.email });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists!",
    });
  }

  const newUser = await UserModel.create({ ...userData, role: "user" });

  res.status(201).json({
    message: "Email verified successfully! Your account has been created.",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export const deferMet = TryCatch(async (req, res) => {
  const [user, wallet] = await Promise.all(
    UserModel.findOne({ userId, isDeleted: false }),
    walletModel.findOne({ userId, isDeleted: false })
  );
});

export const userLogin = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = loginSchema.safeParse(sanitizedBody);

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

  const { email, password } = validation.data;

  const rateLimitKey = `loginRateLimit_${req.ip}_${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res
      .status(429)
      .json({ message: "Too many requests, try again later!" });
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Invalid credentials!",
    });
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.status(404).json({
      message: "Invalid credentials!",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp_${email}`;

  await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

  const subject = "OTP for verifications!";

  const html = htmlTemplate({ email, otp });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message: "An OTP is sent on your registered mail address. Valid for 5mins.",
  });
});

export const verifyOtp = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(404).json({
      message: "Please provide all details!",
    });
  }

  const otpKey = `otp_${email}`;

  const storedOtpString = await redisClient.get(otpKey);

  if (!storedOtpString) {
    return res.status(400).json({
      message: "OTP Expired!",
    });
  }

  const storedOtp = JSON.parse(storedOtpString);

  if (storedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  await redisClient.del(otpKey);

  let user = await UserModel.findOne({ email }).lean();

  const tokenData = await generateToken({ userId: user._id, res });

  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    message: `Welcome ${user.name}!`,
    data: userWithoutPassword,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = req.user;

  res.json(user);
});
