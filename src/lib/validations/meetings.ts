import { z } from "zod";

export const meetingSchema = z.object({
  projectId: z.string(),
  startsAt: z.string().datetime(),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: z.enum(["Scheduled", "Started", "Finished", "Cancelled"]).optional(),
});

export const updatedMeetingSchema = z.object({
  projectId: z.string().optional(),
  startsAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: z.enum(["Scheduled", "Started", "Finished", "Cancelled"]).optional(),
});
