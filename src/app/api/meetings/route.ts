import { getCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { meetingSchema } from "@/lib/validations/meetings";

export async function GET() {
  const userId = await getCurrentUserId();
  const meetings = await prisma.meeting.findMany({
    include: { project: true },
    where: { project: { client: { userId } } },
  });

  return Response.json(meetings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const result = meetingSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const userId = await getCurrentUserId()

  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId, client:{userId} },
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
