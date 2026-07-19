import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Case-sensitive redirect for /Explore → /explore.
 * next.config redirects are case-insensitive on Windows and can loop.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const browserHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();

  // Discord OAuth returns to localhost. Keep the entire local app on that same
  // hostname so the browser sends the session cookie after the callback.
  if (
    process.env.NODE_ENV !== "production" &&
    (browserHost === "0.0.0.0" || browserHost === "127.0.0.1")
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "localhost";
    return NextResponse.redirect(url);
  }

  if (pathname === "/Explore" || pathname.startsWith("/Explore/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/Explore/, "/explore");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
