import { NextRequest, NextResponse } from "next/server";

// 🌐 Define standard public routes
const publicRoutes = ["/login", "/register", "/public"];
// 🛠️ Specific admin setup route (temporarily open for initial configuration)
const adminSetupRoute = "/admin/create-super-user";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔐 Extract tokens using the new sensible naming convention
  const postToken = request.cookies.get("postAccessToken")?.value;
  const officerToken = request.cookies.get("officerAccessToken")?.value;

  const token = postToken || officerToken;

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if current path is the specific admin setup page
  const isAdminSetup = pathname === adminSetupRoute;

  /* ==========================================================
     🛡️ CASE 1: UN-AUTHENTICATED ACCESS
     If not logged in and not on a public/setup route, go to login.
  ========================================================== */
  if (!isPublicRoute && !isAdminSetup && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ==========================================================
     🛡️ CASE 2: AUTHENTICATED ACCESS TO PUBLIC PAGES
     If logged in, prevent access to login/register/setup pages.
  ========================================================== */
  if ((isPublicRoute || isAdminSetup) && token) {
    // Priority 1: Station/Post Dashboard
    if (postToken) {
      return NextResponse.redirect(new URL("/post/dashboard", request.url));
    }
    // Priority 2: Individual Officer Entry Page
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
  }

  // Allow the request to proceed if it passes the checks above
  return NextResponse.next();
}

/* ==========================================================
   ⚙️ MIDDLEWARE CONFIGURATION
   Applies to all routes EXCEPT:
   - API routes (/api)
   - Static files (_next/static)
   - Images (_next/image)
   - Favicon
========================================================== */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
