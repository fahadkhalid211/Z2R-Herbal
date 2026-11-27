import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(80, "Please use 80 characters or fewer.");

export const emailSchema = z.string().trim().pipe(z.email("Please enter a valid email address."));

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]*$/, "Please enter a valid contact number.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  }, "Please enter a valid contact number.");

export const PASSWORD_MIN = 12;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(128, "Please use 128 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password."),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
] as const;

export const checkoutSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z
    .string()
    .trim()
    .min(8, "Please enter your full shipping address.")
    .max(300, "Please use 300 characters or fewer."),
  city: z.string().trim().min(2, "Please enter your city.").max(60, "Please use 60 characters or fewer."),
  province: z.enum(PROVINCES, { error: "Please select your province." }),
  notes: z.string().trim().max(500, "Please use 500 characters or fewer.").optional(),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.union([z.literal(""), phoneSchema]).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more so we can help.")
    .max(2000, "Please use 2,000 characters or fewer."),
});

export const trackOrderSchema = z.object({
  orderId: z.string().trim().min(1, "Please enter your Order ID.").max(60, "Please check your Order ID."),
  contact: z.union([emailSchema, phoneSchema], "Enter your registered phone number or email address."),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
