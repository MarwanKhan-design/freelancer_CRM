import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";

export async function GET() {
  const projects = await prisma.project.findMany();

  return Response.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = projectSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: result.data?.clientId },
  });

  if (!client) {
    return Response.json({ error: "Client Not Found" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      ...result.data,
      budgetValue: new Prisma.Decimal(result.data.budgetValue),
      deadline: result.data.deadline
        ? new Date(result.data.deadline)
        : undefined,
    },
  });

  return Response.json(project, { status: 201 });
}
