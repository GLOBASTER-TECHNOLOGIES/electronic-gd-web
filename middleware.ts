import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // CASE 1: User is on the Login page
  if (pathname === "/login") {
    if (token) {
      // If they are already logged in, kick them to the admin dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // CASE 2: User is on a Protected Route (e.g., /admin or /(protected))
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // CASE 3: User is logged in and on a protected route -> Allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/(protected)/:path*", // Use this if you are using route groups
  ],
};
