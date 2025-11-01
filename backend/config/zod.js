import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long!")
    .max(50, "Name cannot exceed 50 characters!")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces!"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address format!")
    .refine((val) => !/\s/.test(val), "Email address cannot contain spaces!"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long!")
    .max(64, "Password cannot exceed 64 characters!")
    .refine(
      (val) => /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter!"
    )
    .refine(
      (val) => /[a-z]/.test(val),
      "Password must contain at least one lowercase letter!"
    )
    .refine(
      (val) => /\d/.test(val),
      "Password must contain at least one number!"
    )
    .refine(
      (val) => /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
      "Password must contain at least one special character!"
    )
    .refine((val) => !/\s/.test(val), "Password cannot contain spaces!"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address format!")
    .refine((val) => !/\s/.test(val), "Email address cannot contain spaces!"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long!")
    .max(64, "Password cannot exceed 64 characters!")
    .refine(
      (val) => /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter!"
    )
    .refine(
      (val) => /[a-z]/.test(val),
      "Password must contain at least one lowercase letter!"
    )
    .refine(
      (val) => /\d/.test(val),
      "Password must contain at least one number!"
    )
    .refine(
      (val) => /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
      "Password must contain at least one special character!"
    )
    .refine((val) => !/\s/.test(val), "Password cannot contain spaces!"),
});
