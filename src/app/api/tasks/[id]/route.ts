import prisma from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validations/tasks";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!task) {
    return Response.json({ error: "Task not Found" }, { status: 404 });
  }
  return Response.json(task, { status: 200 });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const result = taskUpdateSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  if (result.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: result.data.projectId },
    });
    if (!project) {
      return Response.json({ error: "Project Not Found" }, { status: 404 });
    }
  }
  const updatedTask = await prisma.task.update({
    where: { id },
    data: result.data,
  });

  return Response.json(updatedTask);
}
