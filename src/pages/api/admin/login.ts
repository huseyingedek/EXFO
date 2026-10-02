import {
  createSessionToken,
  getAdminConfig,
  REMEMBER_DAYS,
  SESSION_COOKIE,
  SESSION_HOURS,
  verifyPassword,
} from "@/lib/auth";
import type { APIRoute } from "astro";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Best-effort brute-force protection (per server instance).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; first: number }>();

const isLimited = (ip: string) => {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
};

const registerFailure = (ip: string) => {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const POST: APIRoute = async ({ request, cookies, clientAddress, url }) => {
  const config = getAdminConfig();
  if (!config.configured) {
    console.error(
      "Admin login is not configured: set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET (min. 32 chars).",
    );
    return json({ success: false, error: "not_configured" }, 503);
  }

  let ip = "unknown";
  try {
    ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || clientAddress || "unknown";
  } catch {
    // clientAddress is not available in every adapter
  }

  if (isLimited(ip)) {
    return json({ success: false, error: "too_many_attempts" }, 429);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "invalid_request" }, 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const remember = body.remember === true;

  // Always run the (slow) password check so timing doesn't reveal the e-mail.
  const passwordOk = await verifyPassword(password, config.passwordHash);
  const emailOk = email === config.email;

  if (!passwordOk || !emailOk) {
    registerFailure(ip);
    await sleep(400);
    return json({ success: false, error: "invalid_credentials" }, 401);
  }

  attempts.delete(ip);
  const maxAge = remember ? REMEMBER_DAYS * 24 * 3600 : SESSION_HOURS * 3600;
  const token = await createSessionToken(config.email, maxAge);

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  return json({ success: true });
};
