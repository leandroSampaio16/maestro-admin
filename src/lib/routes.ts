export const publicRoutes: string[] = [ "/api", ".next"];

export const authRoutes: string[] = ["/login", "/signup"];

export const protectedRoutes: string[] = ["/organizations"];

export function isPublicRoute(pathname: string): boolean {
	// Remove locale prefix to check the base path
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
	return publicRoutes.some((route) => pathWithoutLocale.startsWith(route));
}

export function isAuthRoute(pathname: string): boolean {
	// Remove locale prefix to check the base path
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
	return authRoutes.includes(pathWithoutLocale);
}
