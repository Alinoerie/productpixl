import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/generate",
  "/copy",
  "/products",
  "/account",
  "/brand",
  "/brands",
  "/onboarding",
];

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isProtected && !req.auth?.user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|showcase).*)"],
};
