# EFXO Market Miners — website

Professional forex & CFD education website. Built with **Astro 7 + Tailwind CSS 4**, deployed on **Vercel**.
Based on the free *Automark* template by Themefisher (MIT).

## Languages

| Language | URL prefix | Content folder |
| --- | --- | --- |
| Dutch (default) | `/` | `src/content/<collection>/nl/` |
| English | `/en` | `src/content/<collection>/en/` |

Pages have localized URLs (e.g. `/lidmaatschap` ↔ `/en/membership`). All URLs are defined in one place:
**`src/i18n/config.ts` → `routes`**. In content files, link to a page with `route:<key>`
(e.g. `link: "route:membership"`) and the correct language URL is filled in automatically.

The language switcher in the header always points to the same page in the other language, and every page
outputs `hreflang` alternates for SEO.

## Where to edit what

| What | File |
| --- | --- |
| Page texts (home, courses, membership, about, contact, FAQ, CTA…) | `src/content/**/nl/*.md` and `src/content/**/en/*.md` |
| Blog / insights articles | `src/content/blog/nl/` and `src/content/blog/en/` (use the **same file name** in both languages so they link to each other) |
| Legal pages (risk warning, privacy, terms) | `src/content/pages/nl/` and `src/content/pages/en/` |
| Menu, footer, buttons, form labels, risk-warning text | `src/i18n/nl.json` and `src/i18n/en.json` |
| Membership **prices** (used by the cards *and* Stripe) | `src/config/plans.json` |
| E-mail, phone, KvK number, VAT number, address | `src/config/config.json` |
| Colours & fonts | `src/config/theme.json` |

## Before going live — checklist

- [ ] Fill in `company.kvk`, `company.address` (and `vat` if applicable) in `src/config/config.json` — required on Dutch business websites.
- [ ] Replace `[adres invullen]` / `[KvK-nummer invullen]` placeholders in the legal pages (`src/content/pages/**`).
- [ ] Have the legal pages (risk warning, privacy policy, terms) reviewed by a lawyer.
- [ ] Check the prices in `src/config/plans.json` (prices are shown **including VAT**).
- [ ] Replace the template stock photos (team, founder, about image) with real photos.
- [ ] Make sure the statistics (students, hours, satisfaction) are real and verifiable.
- [ ] Set all environment variables (see below) in Vercel.

## Environment variables

Copy `.env.example` to `.env` for local development. On Vercel: *Project → Settings → Environment Variables*.

### Admin panel (`/admin/login`)

```bash
node scripts/hash-password.mjs "your-strong-password"
```

This prints `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Set them together with `ADMIN_EMAIL`.
Passwords are stored as a PBKDF2 hash; sessions use a signed, HttpOnly cookie. Every route under `/admin`
and `/api/admin` is protected by `src/middleware.ts`. Changing `ADMIN_SESSION_SECRET` signs everyone out.

> The dashboard still shows **demo data**. Connect it to Stripe / GoHighLevel to show real customers.

### Stripe

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook endpoint: `https://<domain>/api/webhooks/stripe`, event `checkout.session.completed`).
- The checkout only receives a **plan id**; the amount always comes from `src/config/plans.json` on the server
  (or from optional Stripe Price IDs `STRIPE_PRICE_<PLAN>_<MONTHLY|YEARLY>`).
- Currency is EUR. Payment methods are not hard-coded: enable **iDEAL / SEPA, Bancontact, cards, Apple Pay** etc. in the Stripe Dashboard.

### GoHighLevel

`GHL_API_KEY`, `GHL_LOCATION_ID` — contact form, free e-book form and checkout leads are sent to GHL
(tagged with `lang-nl` / `lang-en`).

## Commands

| Command | Action |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `http://localhost:4321` |
| `pnpm build` | Build for production |
| `pnpm check` | Type-check the project |

## License

Template design & code © Themefisher, MIT licensed. Template images are for demonstration purposes only.
