import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";


export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function createToken(userId: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return token;
}

export async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const secretKey = new TextEncoder().encode(secret);

  const { payload } = await jwtVerify(token, secretKey);

  if (typeof payload.userId !== "string") {
    throw new Error("User Id is not defined");
  }

  return payload.userId;
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null
  }

  try {
    const userId = await verifyToken(token);
    return userId;
  } catch {
    return null
  }
}


export async function requireAuth(){
  const userId = await getCurrentUserId()

  if(userId === null){
    throw new UnauthorizedError()
  }
  return userId
}