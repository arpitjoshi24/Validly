import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
  role: z.enum(["FOUNDER", "CONSUMER"]),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;