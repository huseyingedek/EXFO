import en from "./en.json";
import nl from "./nl.json";

// ─── Languages ───────────────────────────────────────────────────────────────
// Dutch is the default language and lives at the root ("/").
// English lives under "/en".

export const languages = {
  nl: { label: "Nederlands", short: "NL", htmlLang: "nl", ogLocale: "nl_NL" },
  en: { label: "English", short: "EN", htmlLang: "en", ogLocale: "en_GB" },
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "nl";
export const langs = Object.keys(languages) as Lang[];

// ─── Routes ──────────────────────────────────────────────────────────────────
// One key per page, with a localized URL for every language.
// Change a slug here and every menu, button and language switcher follows.

export const routes = {
  home: { nl: "/", en: "/en" },
  courses: { nl: "/opleidingen", en: "/en/courses" },
  membership: { nl: "/lidmaatschap", en: "/en/membership" },
  insights: { nl: "/analyses", en: "/en/insights" },
  about: { nl: "/over-ons", en: "/en/about" },
  contact: { nl: "/contact", en: "/en/contact" },
  thanks: { nl: "/bedankt", en: "/en/thank-you" },
  risk: { nl: "/risicowaarschuwing", en: "/en/risk-warning" },
  privacy: { nl: "/privacybeleid", en: "/en/privacy-policy" },
  terms: { nl: "/algemene-voorwaarden", en: "/en/terms" },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && value in languages;

/** Localized URL for a route key, e.g. path("membership", "en") → "/en/membership" */
export const path = (key: RouteKey, lang: Lang): string => routes[key][lang];

/** URLs of the same page in every language (used for hreflang + switcher). */
export const alternatesFor = (key: RouteKey): Record<Lang, string> =>
  ({ ...routes[key] }) as Record<Lang, string>;

/** Detect the language from a pathname ("/en/..." → en, everything else → nl). */
export const langFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : defaultLang;

/**
 * Resolve a link written in content/config files.
 * - "route:membership"  → localized route
 * - "route:membership#faq" → localized route + hash
 * - anything else (absolute URL, mailto:, /path) → returned as-is
 */
export const resolveLink = (link: string, lang: Lang): string => {
  if (!link?.startsWith("route:")) return link;
  const [key, hash] = link.slice("route:".length).split("#");
  const base = routes[key as RouteKey]?.[lang];
  if (!base) {
    console.error(`\x1b[31mUnknown route key in link: ${link}\x1b[0m`);
    return "/";
  }
  return hash ? `${base}#${hash}` : base;
};

export const isExternal = (link: string) => /^https?:\/\//.test(link);

// ─── UI strings ──────────────────────────────────────────────────────────────

const dictionaries = { nl, en } as const;
export type Dictionary = typeof nl;

/** Full dictionary for a language (menus, footer, labels, meta). */
export const useTranslations = (lang: Lang): Dictionary =>
  dictionaries[lang] as Dictionary;
