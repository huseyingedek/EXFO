import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

// Protects everything under /admin and /api/admin.
// Only the login page and the login API are reachable without a session.
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname.replace(/\/$/, "") || "/";
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (!isAdminPage && !isAdminApi) return next();

  // Admin routes are always rendered on demand; never trust a prerendered page.
  if (context.isPrerendered) return next();

  const session = await verifySessionToken(
    context.cookies.get(SESSION_COOKIE)?.value,
  );
  context.locals.admin = session;

  if (!session && !PUBLIC_ADMIN_PATHS.has(pathname)) {
    if (isAdminApi) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    return context.redirect("/admin/login", 303);
  }

  const response = await next();
  try {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  } catch {
    // some responses (e.g. redirects) have immutable headers
  }
  return response;
});
