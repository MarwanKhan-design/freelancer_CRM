import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { calculateInvoiceTotal } from "@/lib/invoice-calculations";
import prisma from "@/lib/prisma";

export const POST = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireAuth();

  const invoice = await prisma.invoice.findFirst({
    where: { id, project: { client: { userId } } },
    include: { items: true },
  });

  if (!invoice) {
    return Response.json({ error: "Invoice Not Found" }, { status: 404 });
  }

  if (invoice.status !== "Draft") {
    return Response.json({ error: "Invoice is not Draft" });
  }

  if (invoice.items.length <= 0) {
    return Response.json({ error: "No items in Invoice" });
  }

  const total = calculateInvoiceTotal(invoice.items);

  if (total == null) {
    return Response.json({ error: "All Items must include prices" });
  }

  if (!total.gt(0)) {
    return Response.json({ error: "Total mush be greater then 0" });
  }

  const updateInvoice = await prisma.invoice.update({
    where: { id, project: { client: { userId } }, status: 'Draft' },
    data: { status: "Sent" },
  });

  return Response.json(updateInvoice);
});
