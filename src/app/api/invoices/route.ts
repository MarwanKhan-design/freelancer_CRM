import { Prisma } from "@/generated/prisma/client";
import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { calculateInvoiceTotal } from "@/lib/invoice-calculations";
import prisma from "@/lib/prisma";
import { InvoiceSchema } from "@/lib/validations/invoice";

export const GET = withErrorHandling(async function (request: Request) {
  const userId = await requireAuth();
  const invoices = await prisma.invoice.findMany({
    where: { project: { client: { userId } } },
    include: { items: true },
  });

  const invoices_with_total = invoices.map((invoice) => ({
    ...invoice,
    total: calculateInvoiceTotal(invoice.items),
  }));

  return Response.json(invoices_with_total);
});

export const POST = withErrorHandling(async function (request: Request) {
  const body = await request.json();

  const result = InvoiceSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const userId = await requireAuth();

  const project = await prisma.project.findFirst({
    where: { id: result.data.projectId, client: { userId } },
  });

  if (!project) {
    return Response.json({ error: "Project Not Found" }, { status: 404 });
  }

  const invoice_exists = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: result.data.invoiceNumber,
      project: { client: { userId } },
    },
  });

  if (invoice_exists) {
    return Response.json(
      { error: "Invoice Number Already Exists" },
      { status: 409 },
    );
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: result.data.invoiceNumber,
      currency: result.data.currency,
      projectId: result.data.projectId,
      issueDate: result.data.issueDate
        ? new Date(result.data.issueDate)
        : undefined,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
      notes: result.data.notes,
      items: {
        create: result.data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice ? new Prisma.Decimal(item.unitPrice) : null,
        })),
      },
    },
    include: { items: true },
  });

  return Response.json(invoice, { status: 201 });
});
