import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define static file extensions
  const staticFileExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico',
    'css', 'js', 'json', 'txt',
    'woff', 'woff2', 'ttf', 'eot'
  ];

  // Check if the pathname ends with a static file extension
  const isStaticFile = staticFileExtensions.some(ext => 
    pathname.toLowerCase().endsWith(`.${ext}`)
  );

  // If it's a static file, skip authentication
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Better Auth uses this cookie name by default for session tokens
  const sessionCookie = request.cookies.get("better-auth.session_token");
   
  const isAuthRoute = pathname.startsWith("/auth");

  // Protect the root dashboard and other sensitive routes
  // Redirect to sign-in if the user is not authenticated
  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // If user is already authenticated and tries to visit auth pages, redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
