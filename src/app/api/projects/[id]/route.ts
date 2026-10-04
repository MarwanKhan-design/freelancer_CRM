import { Prisma } from "@/generated/prisma/client";
import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations/project";

export const GET = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireAuth();
  const project = await prisma.project.findUnique({
    where: { id, client: { userId } },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(project);
});

export const PATCH = withErrorHandling(async function (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await params;
  const userId = await requireAuth();

  const result = updateProjectSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  if (result.data.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: result.data.clientId, userId },
    });
    if (!client) {
      return Response.json({ error: "Client Not found" }, { status: 404 });
    }
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id, client: {userId} },
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

    return Response.json(updatedProject);
  } catch (error) {
    return Response.json({ error: "Project Not found" }, { status: 404 });
  }
});
