import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/public"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const postToken = request.cookies.get("postAccessToken")?.value;
  const officerToken = request.cookies.get("accessToken")?.value;

  const token = postToken || officerToken;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔐 Not logged in & trying protected route
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔐 Logged in & trying login page
  if (isPublicRoute && token) {
    if (postToken) {
      return NextResponse.redirect(new URL("/post/dashboard", request.url));
    }
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
