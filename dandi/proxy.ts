import authProxy from "next-auth/middleware";

export default function proxy(req: Parameters<typeof authProxy>[0]) {
  return authProxy(req);
}

export const config = {
  // Include exact `/dashboard` and `/api/keys` — patterns like `/segment/:path*` often
  // do not match the segment root, leaving auth unenforced and breaking redirects.
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/playground",
    "/playground/:path*",
    "/api/keys",
    "/api/keys/:path*",
  ],
};

