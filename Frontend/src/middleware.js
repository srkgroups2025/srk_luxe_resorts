import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin-panel")) {
    const cookie = request.cookies.get("userInfo");

    if (!cookie) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    let user;

    try {
      user = JSON.parse(decodeURIComponent(cookie.value));
    } catch {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-panel/:path*"],
};
