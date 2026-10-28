import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protection middleware using NextAuth JWT validation.
 *
 * Public routes (no authentication required):
 *   /login
 *   /api/auth/*  (NextAuth internal + login/forgot-password/reset-password)
 *
 * Protected routes (valid JWT session cookie required):
 *   / (dashboard)
 *   /api/customers
 *   /api/pipeline
 *   /api/tours
 *   /api/dashboard/stats
 */
export default withAuth(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function middleware(_req) {
    // withAuth already verified the token — just pass through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // token is null when unauthenticated → withAuth redirects to signIn page
        return token !== null;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     *  - /login (the sign-in page itself)
     *  - /api/auth/* (NextAuth handlers, login, forgot-password, reset-password)
     *  - /_next/* (Next.js internals)
     *  - /public assets (favicon, images)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
