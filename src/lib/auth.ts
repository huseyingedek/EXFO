// ─────────────────────────────────────────────────────────────────────────────
// Admin authentication
//
// • One admin account, configured with environment variables:
//     ADMIN_EMAIL           the login e-mail address
//     ADMIN_PASSWORD_HASH   generated with:  node scripts/hash-password.mjs "your-password"
//     ADMIN_SESSION_SECRET  a long random string (min. 32 characters)
// • Passwords are stored as a PBKDF2-SHA256 hash (never in plain text).
// • A successful login sets a signed, HttpOnly session cookie.
// • Uses the Web Crypto API only, so it runs on Node, Vercel and edge runtimes.
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "efxo_admin";
export const SESSION_HOURS = 8;
export const REMEMBER_DAYS = 30;

const PBKDF2_ITERATIONS = 600_000;
const HASH_PREFIX = "pbkdf2-sha256";
const encoder = new TextEncoder();

// ─── env ─────────────────────────────────────────────────────────────────────
const runtimeEnv = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env?.[key] : undefined;

export const getAdminConfig = () => {
  const email = (runtimeEnv("ADMIN_EMAIL") ?? import.meta.env.ADMIN_EMAIL ?? "")
    .trim()
    .toLowerCase();
  const passwordHash = (
    runtimeEnv("ADMIN_PASSWORD_HASH") ??
    import.meta.env.ADMIN_PASSWORD_HASH ??
    ""
  ).trim();
  const secret = (
    runtimeEnv("ADMIN_SESSION_SECRET") ??
    import.meta.env.ADMIN_SESSION_SECRET ??
    ""
  ).trim();
  const configured =
    Boolean(email) && passwordHash.startsWith(`${HASH_PREFIX}:`) && secret.length >= 32;
  return { email, passwordHash, secret, configured };
};

// ─── base64url helpers ───────────────────────────────────────────────────────
const toB64Url = (bytes: Uint8Array): string => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromB64Url = (value: string): Uint8Array => {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** Constant-time comparison to avoid timing attacks. */
const safeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

// ─── passwords ───────────────────────────────────────────────────────────────
const pbkdf2 = async (password: string, salt: Uint8Array, iterations: number) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.slice(), iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
};

/** Format: pbkdf2-sha256:<iterations>:<salt>:<hash>  (base64url) */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_PREFIX}:${PBKDF2_ITERATIONS}:${toB64Url(salt)}:${toB64Url(hash)}`;
};

export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<boolean> => {
  const [prefix, iter, saltB64, hashB64] = stored.split(":");
  const iterations = Number(iter);
  if (prefix !== HASH_PREFIX || !iterations || !saltB64 || !hashB64) return false;
  try {
    const expected = fromB64Url(hashB64);
    const actual = await pbkdf2(password, fromB64Url(saltB64), iterations);
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
};

// ─── sessions ────────────────────────────────────────────────────────────────
export interface AdminSession {
  email: string;
  /** expiry, unix seconds */
  exp: number;
}

const hmac = async (data: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
};

export const createSessionToken = async (
  email: string,
  maxAgeSeconds: number,
): Promise<string> => {
  const { secret } = getAdminConfig();
  const payload: AdminSession = {
    email,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const body = toB64Url(encoder.encode(JSON.stringify(payload)));
  const sig = toB64Url(await hmac(body, secret));
  return `${body}.${sig}`;
};

export const verifySessionToken = async (
  token: string | undefined,
): Promise<AdminSession | null> => {
  if (!token) return null;
  const { secret, email, configured } = getAdminConfig();
  if (!configured) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  try {
    const expected = await hmac(body, secret);
    if (!safeEqual(fromB64Url(sig), expected)) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as AdminSession;
    if (typeof session.exp !== "number" || session.exp < Date.now() / 1000) return null;
    // A changed ADMIN_EMAIL invalidates existing sessions
    if (session.email !== email) return null;
    return session;
  } catch {
    return null;
  }
};
