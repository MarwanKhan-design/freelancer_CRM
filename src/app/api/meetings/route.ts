import prisma from "@/lib/prisma";
import { meetingSchema } from "@/lib/validations/meetings";

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    include: { project: true },
  });

  return Response.json(meetings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const result = meetingSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId },
  });

  if (!project) {
    return Response.json({ error: "Project does not exist" }, { status: 404 });
  }

  const updatedStartsAt = new Date(result.data.startsAt);

  const meeting = await prisma.meeting.create({
    data: { ...result.data, startsAt: updatedStartsAt },
  });

  return Response.json(meeting);
}
