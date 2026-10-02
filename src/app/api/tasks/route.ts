import { taskSchema } from "@/lib/validations/tasks";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  const tasks = await prisma.task.findMany({
    include: { project: true },
    where: { project: { client: { userId } } },
  });

  return Response.json(tasks, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();

  const result = taskSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const userId = await getCurrentUserId();
  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId, client: { userId } },
  });
  if (!project) {
    return Response.json({ error: "Project does not exist" }, { status: 404 });
  }

  const task = await prisma.task.create({ data: { ...result.data } });

  return Response.json(task, { status: 201 });
}
