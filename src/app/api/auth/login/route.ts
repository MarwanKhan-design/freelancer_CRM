import { createToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (!user) {
    return Response.json(
      { error: "Invalid Email or Password" },
      { status: 404 },
    );
  }

  const passMatch = await bcrypt.compare(
    result.data.password,
    user.passwordHash,
  );

  if (!passMatch) {
    return Response.json(
      { error: "Invalid Email or Password" },
      { status: 400 },
    );
  }

  const token = await createToken(user.id);
  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return Response.json({
    name: user.name,
    email: user.email,
    status: user.status,
  });
}
