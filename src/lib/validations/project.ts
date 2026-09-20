import { z } from "zod";

const budgetValueSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid budget amount")
  .refine((value) => Number(value) > 0, {
    message: "Budget must be greater than zero",
  });

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientId: z.string().min(1, "Client ID is required"),
  description: z.string().optional(),
  inCollaborationWith: z.string().optional(),
  deadline: z.string().datetime().optional(),
  budgetValue: budgetValueSchema.optional(),
  budgetCurrency: z.string().length(3).toUpperCase().optional(),
  message: z.string().optional(),
  deploymentLink: z.string().url().or(z.literal("")).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  clientId: z.string().min(1, "Client ID is required").optional(),
  description: z.string().trim().optional(),
  inCollaborationWith: z.string().optional(),
  deadline: z.string().datetime().optional(),
  budgetValue: budgetValueSchema.optional(),
  budgetCurrency: z.string().length(3).toUpperCase().optional(),
  message: z.string().optional(),
  deploymentLink: z.string().url().or(z.literal("")).optional(),
  status: z
    .enum(["Planning", "InProgress", "Completed", "OnHold", "Cancelled"])
    .optional(),
});
