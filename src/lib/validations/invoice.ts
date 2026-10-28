import { z } from "zod";

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  currency: z.string().length(3),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  projectId: z.string(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
      }),
    )
    .min(1),
});

export const UpdateInvoiceSchema = InvoiceSchema.omit({
  projectId: true,
}).partial();
