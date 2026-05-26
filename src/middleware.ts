import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/login/check-email",
  "/privacy",
  "/terms",
  "/guides/ecommerce",
  "/demo",
  "/pricing",
  "/grader",
  "/how-it-works",
  "/gallery",
  "/compare",
  "/faq",
  "/marketplaces",
]);
const PUBLIC_PREFIXES = ["/api/auth"];

const PROTECTED_PREFIXES = [
  "/studio",
  "/dashboard",
  "/projects",
  "/products",
  "/generate",
  "/copy",
  "/account",
  "/brand",
  "/brands",
  "/onboarding",
  "/playbooks",
  "/my-playbooks",
  "/templates",
  "/batch",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const signedIn = Boolean(req.auth?.user);

  if (!signedIn && !isPublicPath(pathname) && isProtectedPath(pathname)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (signedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/studio", req.nextUrl.origin));
  }

  if (signedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/studio", req.nextUrl.origin));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|showcase|robots.txt|sitemap.xml).*)"],
};
