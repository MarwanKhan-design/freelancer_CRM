import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { taskSchema } from "@/lib/validations/tasks";

export const GET = withErrorHandling(async function () {
  const userId = await requireAuth();
  const tasks = await prisma.task.findMany({
    include: { project: true },
    where: { project: { client: { userId } } },
  });

  return Response.json(tasks, { status: 200 });
});

export const POST = withErrorHandling(async function (req: Request) {
  const body = await req.json();

  const result = taskSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const userId = await requireAuth();
  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId, client: { userId } },
  });
  if (!project) {
    return Response.json({ error: "Project does not exist" }, { status: 404 });
  }

  const task = await prisma.task.create({ data: { ...result.data } });

  return Response.json(task, { status: 201 });
});
