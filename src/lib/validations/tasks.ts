import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task Name is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  status: z.enum(["Todo", "InProgress", "Completed", "Cancelled"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1, "Task Name is required").optional(),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required").optional(),
  status: z.enum(["Todo", "InProgress", "Completed", "Cancelled"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});
