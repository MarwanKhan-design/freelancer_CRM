import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phoneNumber: z.string().min(1),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  country: z.string().min(1),
});

export const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  phoneNumber: z.string().min(1).optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  country: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
