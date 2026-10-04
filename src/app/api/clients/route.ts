import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

export const GET = withErrorHandling(async function () {
  const userId = await requireAuth();
  const clients = await prisma.client.findMany({ where: { userId } });

  return Response.json(clients);
});

export const POST = withErrorHandling(async function (request: Request) {
  const body = await request.json();

  const result = clientSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const userId = await requireAuth();

  const client = await prisma.client.create({
    data: { ...result.data, userId },
  });

  return Response.json(client, { status: 201 });
});
