/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts on /admin routes when a valid session exists. */
    admin?: import("./lib/auth").AdminSession | null;
  }
}

interface ImportMetaEnv {
  readonly ADMIN_EMAIL?: string;
  readonly ADMIN_PASSWORD_HASH?: string;
  readonly ADMIN_SESSION_SECRET?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly GHL_API_KEY?: string;
  readonly GHL_LOCATION_ID?: string;
}
