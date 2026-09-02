import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  if (url.pathname === "/") {
    return NextResponse.rewrite(new URL("/portfolio.html", request.url));
  }
}

export const config = {
  matcher: "/",
};
