import { Prisma } from "@/generated/prisma/client";
import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { calculateInvoiceTotal } from "@/lib/invoice-calculations";
import prisma from "@/lib/prisma";
import { UpdateInvoiceSchema } from "@/lib/validations/invoice";

export const GET = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const userId = await requireAuth();

  const invoice = await prisma.invoice.findFirst({
    where: { id, project: { client: { userId } } },
    include: { items: true, payments: true },
  });

  if (!invoice) {
    return Response.json({ error: "Invoice Not Found" }, { status: 404 });
  }

  const total = calculateInvoiceTotal(invoice.items);

  return Response.json({ ...invoice, total });
});

export const PATCH = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const result = UpdateInvoiceSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const { items, ...invoiceData } = result.data;
  const userId = await requireAuth();

  const invoice = await prisma.invoice.findFirst({
    where: { id, project: { client: { userId } } },
  });

  if (!invoice) {
    return Response.json({ error: "Invoice not Found" }, { status: 404 });
  }
  if (invoice.status !== "Draft") {
    return Response.json(
      { error: "Only draft invoices can be edited" },
      { status: 409 },
    );
  }

  const updatedInvoice = await prisma.$transaction(async (tx) => {
    return await tx.invoice.update({
      where: { id, project: { client: { userId } }, status: "Draft" },
      data: {
        ...invoiceData,
        ...(invoiceData.issueDate !== undefined && {
          issueDate: new Date(invoiceData.issueDate),
        }),
        ...(invoiceData.dueDate !== undefined && {
          dueDate: new Date(invoiceData.dueDate),
        }),

        ...(items !== undefined && {
          items: {
            deleteMany: {},
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice
                ? new Prisma.Decimal(item.unitPrice)
                : null,
            })),
          },
        }),
      },
      include: { items: true },
    });
  });

  return Response.json(updatedInvoice);
});
