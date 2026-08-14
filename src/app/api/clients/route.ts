import prisma from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany();

  return Response.json(clients);
}