import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const profileComplete = Boolean(token?.profileComplete);

    if (path.startsWith("/onboarding") && profileComplete) {
      return NextResponse.redirect(new URL("/enrollments", req.url));
    }

    if (
      (path.startsWith("/tests") ||
        path.startsWith("/enrollments") ||
        path.startsWith("/attempt") ||
        path.startsWith("/results")) &&
      !profileComplete
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/login") || path.startsWith("/register")) {
          return !token;
        }
        if (
          path.startsWith("/tests") ||
          path.startsWith("/enrollments") ||
          path.startsWith("/onboarding") ||
          path.startsWith("/attempt") ||
          path.startsWith("/results") ||
          path.startsWith("/admin")
        ) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/tests/:path*",
    "/enrollments",
    "/onboarding",
    "/attempt/:path*",
    "/results/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
