import { taskSchema } from "@/lib/validations/tasks";
import prisma from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({ include: { project: true } });

  return Response.json(tasks, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  const result = taskSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId },
  });
  if (!project) {
    return Response.json({ error: "Project does not exist" }, { status: 404 });
  }

  const task = await prisma.task.create({ data: { ...result.data } });

  return Response.json(task, { status: 201 });
}
