import prisma from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";

export async function GET() {
  const clients = await prisma.client.findMany();

  return Response.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = clientSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: result.data,
  });

  return Response.json(client, { status: 201 });
}
