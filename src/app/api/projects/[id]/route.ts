import prisma from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations/project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await params;

  const result = updateProjectSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: result.data,
    });

    return Response.json(updatedProject);
  } catch (error) {
    return Response.json({ error: "Project Not found" }, { status: 404 });
  }
}
