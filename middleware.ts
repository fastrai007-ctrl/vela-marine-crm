import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("demo_auth")?.value;
  const isLoginPage = req.nextUrl.pathname === "/login";
  if (!auth && !isLoginPage)
    return NextResponse.redirect(new URL("/login", req.url));
  if (auth && isLoginPage)
    return NextResponse.redirect(new URL("/vessels", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
