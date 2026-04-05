## Why

Hémé Kiitchen's current UI uses Geist (a neutral tech font) on a near-white stone background — visually clean but lacking the warmth and appetite appeal a food brand needs. A culinary-appropriate typography and colour system will make the storefront feel handcrafted, inviting, and true to the brand's artisanal identity.

## What Changes

- Replace the Geist font with a two-font culinary pairing: a warm display/serif for headings and a readable humanist sans-serif for body text
- Introduce a warm-toned colour palette (Red · Orange · Yellow · accent Green) as CSS custom properties and Tailwind theme tokens
- Replace the near-white backdrop (`stone-50`) with a warm parchment/cream tone that harmonises with the food palette
- Update `globals.css` and `layout.tsx` to apply the new fonts and root colours
- Update Tailwind config (`@theme` block) to expose the palette as utility classes

## Capabilities

### New Capabilities
- `culinary-theme`: Brand-level typography and colour-token system for the Hémé Kiitchen storefront — fonts, palette CSS variables, Tailwind tokens, and base body styles

### Modified Capabilities
<!-- none — this is a net-new capability; no existing spec-level behaviour changes -->

## Impact

- `apps/web/src/app/globals.css` — font imports, CSS variables, `@theme` block, body styles
- `apps/web/src/app/layout.tsx` — swap `Geist` import for new font(s), update `<html>` / `<body>` class names
- Visual appearance of all pages (storefront, cart, checkout, about, admin) changes; no logic or API changes
- No new dependencies beyond Google Fonts (loaded via `next/font/google`, already in use)
