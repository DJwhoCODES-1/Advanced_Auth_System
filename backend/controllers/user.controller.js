import { registerSchema } from "../config/zod.js";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import sanitize from "mongo-sanitize";

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

  res.json({
    name,
    email,
    password,
  });
});
