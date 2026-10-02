#!/usr/bin/env node
// Generates the values for the admin login environment variables.
//
//   node scripts/hash-password.mjs "your-strong-password"
//
// Copy the printed lines into your .env file (local) and into the
// Environment Variables of your hosting provider (e.g. Vercel).
// Must stay in sync with src/lib/auth.ts.

import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 600_000;
const password = process.argv[2];

if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"  (min. 12 characters)');
  process.exit(1);
}

const b64url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
const hash = `pbkdf2-sha256:${ITERATIONS}:${b64url(salt)}:${b64url(new Uint8Array(bits))}`;
const secret = b64url(crypto.getRandomValues(new Uint8Array(32)));

console.log("\nAdd these to your environment variables:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${secret}`);
console.log("\n(Keep ADMIN_SESSION_SECRET private. Changing it signs out every admin session.)\n");
