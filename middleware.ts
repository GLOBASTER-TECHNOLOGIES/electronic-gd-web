import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/public"];
const adminRoutePrefix = "/admin"; // Protects /admin and anything under it

// ⚠️ Middleware must now be async to handle the fetch request
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const postToken = request.cookies.get("postAccessToken")?.value;
  const officerToken = request.cookies.get("officerAccessToken")?.value;

  const token = postToken || officerToken;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

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
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
  }

  /* ==========================================================
      🛡️ CASE 3: SPECIFIC ROUTE PROTECTION 
  ========================================================== */
  if (pathname.startsWith("/post") && !postToken) {
    if (officerToken) {
      return NextResponse.redirect(new URL("/gd/add-entry", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* ==========================================================
      👑 CASE 4: ADMIN RANK VERIFICATION (THE NEW LOGIC)
  ========================================================== */
  if (pathname.startsWith(adminRoutePrefix)) {
    try {
      // Adjust this URL to match your actual API endpoint path
      const authMeUrl = new URL("/api/auth/me", request.url); 
      
      // Fetch user data, forwarding the cookies so the API can identify the user
      const response = await fetch(authMeUrl, {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        // Token might be invalid or expired
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const userData = await response.json();

      // Check if the user has the required rank
      if (userData.rank !== "admin") {
        // Kick them back to their appropriate dashboard
        if (postToken) return NextResponse.redirect(new URL("/post/dashboard", request.url));
        if (officerToken) return NextResponse.redirect(new URL("/gd/add-entry", request.url));
        
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      console.error("Failed to verify admin rank in middleware:", error);
      // Fail securely: If the API is down, deny access to the admin panel
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};