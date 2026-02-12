import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/public"];
const adminSetupRoute = "/admin/create-super-user";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const postToken = request.cookies.get("postAccessToken")?.value;
  const officerToken = request.cookies.get("officerAccessToken")?.value;

  const token = postToken || officerToken;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminSetup = pathname === adminSetupRoute;

  /* ==========================================================
      🛡️ CASE 1: UN-AUTHENTICATED ACCESS
  ========================================================== */
  if (!isPublicRoute && !isAdminSetup && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ==========================================================
      🛡️ CASE 2: AUTHENTICATED ACCESS TO PUBLIC PAGES
  ========================================================== */
  if ((isPublicRoute || isAdminSetup) && token) {
    if (postToken) {
      return NextResponse.redirect(new URL("/post/dashboard", request.url));
    }
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
  }

  /* ==========================================================
      🛡️ CASE 3: SPECIFIC ROUTE PROTECTION (THE FIX)
      If trying to access /post routes, MUST have postToken.
  ========================================================== */
  if (pathname.startsWith("/post") && !postToken) {
    // If they have an officer token, send them to their allowed page
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
    // Otherwise, back to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
