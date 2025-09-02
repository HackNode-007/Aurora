import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Configure your routes here
const PUBLIC_ROUTES: string[] = [
  "/", // landing page
]

const AUTH_ROUTES: string[] = [
  "/auth/login",
  "/auth/register",
]

const PROFILE_COMPLETION_ROUTE = "/user/profile"

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"))
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // Allow explicitly public routes
  if (isRouteMatch(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // If no session/token and not on an auth route, redirect to login
  if (!token) {
    if (isRouteMatch(pathname, AUTH_ROUTES)) {
      return NextResponse.next()
    }

    const loginUrl = new URL(AUTH_ROUTES[0] ?? "/auth/login", req.url)
    // Preserve the original destination so we can redirect back after login
    const callbackUrl = pathname + (search || "")
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated users try to access auth routes, send them away
  if (isRouteMatch(pathname, AUTH_ROUTES)) {
    const redirectUrl = new URL("/", req.url) // send authenticated users to home for now
    return NextResponse.redirect(redirectUrl)
  }

  // Enforce profile completion for authenticated users
  const profileCompleted = (token as any).profileCompleted ?? false
  if (!profileCompleted && pathname !== PROFILE_COMPLETION_ROUTE && !pathname.startsWith(PROFILE_COMPLETION_ROUTE + "/")) {
    const completeUrl = new URL(PROFILE_COMPLETION_ROUTE, req.url)
    completeUrl.searchParams.set("from", pathname + (search || ""))
    return NextResponse.redirect(completeUrl)
  }

  return NextResponse.next()
}

// Apply middleware to all routes except for static files and Next internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth).*)",
  ],
}
