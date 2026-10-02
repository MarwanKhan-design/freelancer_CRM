import { Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";

export async function GET() {
  const userId = await getCurrentUserId();

  const projects = await prisma.project.findMany({
    where: { client: { userId } },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = projectSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const userId = await getCurrentUserId();

  const client = await prisma.client.findUnique({
    where: { id: result.data?.clientId, userId },
  });

  if (!client) {
    return Response.json({ error: "Client Not Found" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      ...result.data,
      budgetValue: result.data.budgetValue
        ? new Prisma.Decimal(result.data.budgetValue)
        : undefined,
      deadline: result.data.deadline
        ? new Date(result.data.deadline)
        : undefined,
    },
  });

  return Response.json(project, { status: 201 });
}
