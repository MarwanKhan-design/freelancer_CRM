import prisma from "@/lib/prisma";
import { updateClientSchema } from "@/lib/validations/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }

  return Response.json(client);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await params;

  const result = updateClientSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const updatedClient = await prisma.client.update({
      where: { id },
      data: result.data,
    });
    return Response.json(updatedClient);
  } catch (error) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }
}
 