import { Prisma } from "@/generated/prisma/client";

export function calculateInvoiceTotal(
  items: {
    quantity: number;
    unitPrice: Prisma.Decimal | string | null;
  }[],
) {
  const hasUnpricedItems = items.some((item) => item.unitPrice === null);

  if (hasUnpricedItems) {
    return null;
  }

  const total = items.reduce((sum, item) => {
    const itemPrice = new Prisma.Decimal(item.unitPrice!);
    const itemTotal = itemPrice.mul(item.quantity);

    return sum.plus(itemTotal);
  }, new Prisma.Decimal(0));

  return total;
}
