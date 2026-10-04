import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateClientSchema } from "@/lib/validations/client";

export const GET = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireAuth();
  const client = await prisma.client.findUnique({ where: { id, userId } });

  if (!client) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }

  return Response.json(client);
});

export const PATCH = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await params;
  const userId = await requireAuth();

  const result = updateClientSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const updatedClient = await prisma.client.update({
      where: { id, userId },
      data: result.data,
    });
    return Response.json(updatedClient);
  } catch (error) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }
});
