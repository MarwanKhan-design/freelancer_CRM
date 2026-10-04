import { withErrorHandling } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updatedMeetingSchema } from "@/lib/validations/meetings";

export const GET = withErrorHandling(async function (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await requireAuth();

  const meeting = await prisma.meeting.findUnique({
    where: { id, project: { client: { userId } } },
    include: { project: true },
  });

  if (!meeting) {
    return Response.json({ error: "Meeting does not exist" }, { status: 404 });
  }

  return Response.json(meeting, { status: 200 });
});

export const PATCH = withErrorHandling(async function (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();
  const { id } = await params;
  const userId = await requireAuth();

  const meeting = await prisma.meeting.findUnique({
    where: { id, project: { client: { userId } } },
  });
  if (!meeting) {
    return Response.json({ error: "Meeting Not found" }, { status: 404 });
  }

  const result = updatedMeetingSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  if (result.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: result.data.projectId, client: { userId } },
    });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const updatedStartsAt = result.data.startsAt
    ? new Date(result.data.startsAt)
    : undefined;

  const updatedMeeting = await prisma.meeting.update({
    where: { id, project: { client: { userId } } },
    data: { ...result.data, startsAt: updatedStartsAt },
  });

  return Response.json(updatedMeeting, { status: 200 });
});
