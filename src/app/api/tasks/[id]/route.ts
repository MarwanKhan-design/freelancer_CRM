import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validations/tasks";

export const GET = withErrorHandling(async function (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireAuth();
  const task = await prisma.task.findUnique({
    where: { id, project: { client: { userId } } },
    include: { project: true },
  });
  if (!task) {
    return Response.json({ error: "Task not Found" }, { status: 404 });
  }
  return Response.json(task, { status: 200 });
});

export const PATCH = withErrorHandling(async function (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();
  const { id } = await params;

  const userId = await requireAuth();

  const task = await prisma.task.findUnique({
    where: { id, project: { client: { userId } } },
  });
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const result = taskUpdateSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  if (result.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: result.data.projectId, client: { userId } },
    });
    if (!project) {
      return Response.json({ error: "Project Not Found" }, { status: 404 });
    }
  }
  const updatedTask = await prisma.task.update({
    where: { id, project: { client: { userId } } },
    data: result.data,
  });

  return Response.json(updatedTask);
});
