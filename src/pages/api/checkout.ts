import { defaultLang, isLang, path } from "@/i18n/config";
import { currency, getPlan, priceFor, type Interval } from "@/lib/plans";
import type { APIRoute } from "astro";
import Stripe from "stripe";

// This route is server-rendered (Vercel Serverless Function)
export const prerender = false;

interface GHLContactPayload {
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  tags: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Optional: use Prices you created in the Stripe Dashboard instead of
 * inline prices. Set e.g. STRIPE_PRICE_PRO_MONTHLY=price_123 in your env.
 * When a Price ID is set it is used; otherwise the amount from
 * src/config/plans.json is used. Either way the browser never sends a price.
 */
const stripePriceIdFor = (planId: string, interval: Interval) => {
  const key = `STRIPE_PRICE_${planId.toUpperCase()}_${interval === "year" ? "YEARLY" : "MONTHLY"}`;
  const fromRuntime =
    typeof process !== "undefined" ? process.env?.[key] : undefined;
  return fromRuntime || (import.meta.env[key] as string | undefined) || undefined;
};

export const POST: APIRoute = async ({ request, url }) => {
  const GHL_API_KEY = import.meta.env.GHL_API_KEY;
  const GHL_LOCATION_ID = import.meta.env.GHL_LOCATION_ID;
  const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY env var");
    return json({ success: false, error: "Payments are not configured" }, 500);
  }

  // ── 1. Parse & validate input ────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON body" }, 400);
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const lang = isLang(body.lang) ? body.lang : defaultLang;
  const interval: Interval = body.interval === "year" ? "year" : "month";
  const plan = getPlan(body.planId);

  if (!name || !EMAIL_RE.test(email)) {
    return json({ success: false, error: "Name and a valid email are required" }, 400);
  }
  if (!plan) {
    return json({ success: false, error: "Unknown plan" }, 400);
  }

  // The amount is ALWAYS taken from the server-side plan config.
  const amount = priceFor(plan, interval);
  const unitAmount = Math.round(amount * 100);

  const nameParts = name.split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  // ── 2. Create/Upsert GoHighLevel contact (best effort) ──────────────────
  if (GHL_API_KEY && GHL_LOCATION_ID) {
    const payload: GHLContactPayload = {
      locationId: GHL_LOCATION_ID,
      firstName,
      lastName,
      email,
      tags: ["checkout-initiated", `plan-${plan.id}`, `lang-${lang}`],
    };

    try {
      await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // We don't fail the checkout if GHL fails, just log it.
      console.error("GHL integration error during checkout:", err);
    }
  }

  // ── 3. Create Stripe Checkout Session ───────────────────────────────────
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2026-06-24.dahlia",
  });

  const priceId = stripePriceIdFor(plan.id, interval);
  const intervalLabel =
    lang === "nl"
      ? interval === "year" ? "jaarlijks" : "maandelijks"
      : interval === "year" ? "yearly" : "monthly";

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency,
          product_data: {
            name: `EFXO ${plan.name} (${intervalLabel})`,
          },
          unit_amount: unitAmount,
          // Prices on the website are shown including VAT
          tax_behavior: "inclusive",
          recurring: { interval },
        },
        quantity: 1,
      };

  const metadata = { plan_id: plan.id, interval, lang };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // No payment_method_types: Stripe shows the methods you enable in the
      // Dashboard (cards, iDEAL / SEPA, Bancontact, Apple Pay, …).
      line_items: [lineItem],
      customer_email: email,
      locale: lang === "nl" ? "nl" : "en",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata,
      subscription_data: { metadata },
      success_url: `${url.origin}${path("thanks", lang)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}${path("membership", lang)}?canceled=1#pricing`,
    });

    return json({ success: true, url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout error:", err?.message ?? err);
    return json({ success: false, error: "Checkout could not be started" }, 500);
  }
};
