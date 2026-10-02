import plansConfig from "@/config/plans.json";
import type { Lang } from "@/i18n/config";

// Single source of truth for membership prices.
// The pricing cards, the comparison table AND the Stripe checkout API all
// read from src/config/plans.json, so the browser can never choose its own price.

export type Interval = "month" | "year";

export interface Plan {
  id: string;
  name: string;
  /** Price in whole euros, VAT included */
  monthly: number;
  /** Price in whole euros, VAT included */
  yearly: number;
}

export const currency = plansConfig.currency;
export const plans: Plan[] = plansConfig.plans;

export const getPlan = (id: unknown): Plan | undefined =>
  typeof id === "string" ? plans.find((p) => p.id === id) : undefined;

export const priceFor = (plan: Plan, interval: Interval): number =>
  interval === "year" ? plan.yearly : plan.monthly;

const numberLocale: Record<Lang, string> = { nl: "nl-NL", en: "en-IE" };

/** "€ 49" (nl) / "€49" (en) — no decimals for whole amounts. */
export const formatPrice = (amount: number, lang: Lang): string =>
  new Intl.NumberFormat(numberLocale[lang], {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
