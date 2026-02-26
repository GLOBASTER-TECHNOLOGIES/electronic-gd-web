import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/public"];
const adminRoutePrefix = "/admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const postToken = request.cookies.get("postAccessToken")?.value;
  const officerToken = request.cookies.get("officerAccessToken")?.value;
  const visitingToken = request.cookies.get("visitingAccessToken")?.value;

  const token = postToken || officerToken || visitingToken;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  /* ==========================================================
      ✅ ALLOW ALL API ROUTES (IMPORTANT FIX)
  ========================================================== */
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  /* ==========================================================
      🛡️ CASE 1: UN-AUTHENTICATED ACCESS
  ========================================================== */
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ==========================================================
      🛡️ CASE 2: AUTHENTICATED ACCESS TO PUBLIC PAGES
  ========================================================== */
  if (isPublicRoute && token) {
    if (postToken) {
      return NextResponse.redirect(new URL("/post/dashboard", request.url));
    }
    if (officerToken || visitingToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
  }

  /* ==========================================================
      🛡️ CASE 3: POST ROUTE PROTECTION
  ========================================================== */
  if (pathname.startsWith("/post") && !postToken) {
    if (officerToken || visitingToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ==========================================================
      👑 CASE 4: ADMIN ROUTE PROTECTION
  ========================================================== */
  if (pathname.startsWith(adminRoutePrefix)) {
    try {
      const authMeUrl = `${request.nextUrl.origin}/api/auth/me`;

      const response = await fetch(authMeUrl, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const userData = await response.json();
      const rank = userData?.user?.rank;

      if (!rank || rank.toLowerCase() !== "admin") {
        if (postToken)
          return NextResponse.redirect(
            new URL("/post/dashboard", request.url)
          );

        if (officerToken || visitingToken)
          return NextResponse.redirect(
            new URL("/gd/add-entry", request.url)
          );

        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Admin verification failed:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};