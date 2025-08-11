import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { isAuthRoute, isPublicRoute } from "@/lib/routes";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public routes (like API routes) to bypass both i18n and auth
	if (isPublicRoute(pathname)) {
		return NextResponse.next();
	}

	// Apply i18n middleware first
	const response = intlMiddleware(request);

	// Get session after i18n processing
	const sessionCookie = getSessionCookie(request);

	// Extract locale from pathname after i18n middleware processing
	const locale = pathname.split("/")[1];
	const isValidLocale = routing.locales.includes(
		locale as (typeof routing.locales)[number],
	);
	const localePrefix = isValidLocale
		? `/${locale}`
		: `/${routing.defaultLocale}`;

	// Handle auth routes (login, signup)
	if (isAuthRoute(pathname)) {
		if (sessionCookie) {
			// Redirect authenticated users away from auth pages
			return NextResponse.redirect(new URL(`${localePrefix}/`, request.url));
		}
		// Allow unauthenticated users to access auth pages
		return response;
	}

	// Require authentication for all other routes
	if (!sessionCookie) {
		return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
	}

  // Organization selection is handled client-side via Zustand store
  // Server-side org validation occurs in server actions per organizationId

	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
