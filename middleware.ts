import { NextRequest, NextResponse } from "next/server";

// 1. Define the routes that do NOT require authentication
const publicRoutes = ["/login", "/register", "/public"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // 2. Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // CASE 1: User is NOT logged in and tries to access a Protected Route
  // (Logic: It's not public, and they have no token)
  if (!isPublicRoute && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // CASE 2: User IS logged in but tries to access Login page
  if (isPublicRoute && token) {
    // Redirect them to their dashboard/admin page
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // CASE 3: Allow request
  return NextResponse.next();
}

// 3. The Matcher
// This regex matches ALL routes EXCEPT:
// - api routes (/api/...)
// - static files (_next/static/...)
// - image optimization files (_next/image/...)
// - favicon.ico
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
