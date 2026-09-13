import { z } from "zod";

export const projectSchema = z.object({
  name: z.string(),
  clientId: z.string(),
  description: z.string().optional(),
  inCollaborationWith: z.string().optional(),
  deadline: z.string().optional(),
  budgetValue: z.number().positive(),
  budgetCurrency: z.string(),
  message: z.string().optional(),
  deploymentLink: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().optional(),
  clientId: z.string().optional(),
  description: z.string().optional(),
  inCollaborationWith: z.string().optional(),
  deadline: z.string().optional(),
  budgetValue: z.number().positive().optional(),
  budgetCurrency: z.string().optional(),
  message: z.string().optional(),
  deploymentLink: z.string().optional(),
  status: z
    .enum(["Planning", "InProgress", "Completed", "OnHold", "Cancelled"])
    .optional(),
});
