import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function GET(request: Request, context: unknown) {
  const handler = NextAuth(getAuthOptions());
  // NextAuth's handler accepts the App Route context as its 2nd argument.
  return handler(request, context as never);
}

export async function POST(request: Request, context: unknown) {
  const handler = NextAuth(getAuthOptions());
  return handler(request, context as never);
}

