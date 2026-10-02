import prisma from "@/lib/prisma";
import { userSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();

  const result = userSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  const User = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (User) {
    return Response.json({ error: "Email already Exists" }, { status: 400 });
  }

  const hash = await bcrypt.hash(result.data.password, 10);

  const New_User = await prisma.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      passwordHash: hash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });

  return Response.json(New_User);
}
