import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const pricingSchema = z.object({
  base_rate_cents: z.number().int().nonnegative(),
  per_mile_cents: z.number().int().nonnegative(),
  minimum_fee_cents: z.number().int().nonnegative()
});

export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).optional().or(z.literal(""))
});

export const creditSchema = z.object({
  customer_id: z.number().int().positive(),
  delta_cents: z.number().int(),
  note: z.string().optional()
});
