import { UnauthorizedError } from "./auth";

export async function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}

export function withErrorHandling<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async function (...args: Args) {
    try {
      return await handler(...args);
    } catch (error) {
        return handleApiError(error)
    }
  };
}