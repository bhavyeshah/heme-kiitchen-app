## Context

The storefront currently uses Geist (a neutral, tech-oriented sans-serif) on a `stone-50` (#fafaf9) near-white background. The colour tokens are minimal: two CSS variables (`--background`, `--foreground`) with no brand palette. All Tailwind colour usage is ad-hoc `stone-*` and `white`. The site is built with Next.js + Tailwind v4 (using the `@theme inline` syntax in `globals.css`).

## Goals / Non-Goals

**Goals:**
- Introduce a two-font pairing: warm display serif for headings, humanist sans for body
- Define a structured brand palette (Red · Orange · Yellow · Green) as CSS custom properties in `:root` and Tailwind tokens in `@theme`
- Replace the near-white backdrop with a warm parchment tone
- Keep changes isolated to `globals.css` and `layout.tsx` so individual pages require no edits

**Non-Goals:**
- Restyling individual page/component layouts (headings, cards, buttons) — the token layer alone is the scope
- Dark mode support
- Changing layout, spacing, or component structure
- Admin panel visual parity (admin can adopt tokens later)

## Decisions

### Font Pairing: Playfair Display + Nunito

**Chosen**: `Playfair Display` (display serif, headings) + `Nunito` (rounded humanist sans, body).

**Rationale**: Playfair Display has strong culinary/editorial precedent — high contrast strokes and ball terminals that read as artisanal and premium. Nunito's rounded geometry provides friendly legibility at small sizes and contrasts beautifully without fighting Playfair. Both are available on Google Fonts, loaded via `next/font/google` (the same mechanism Geist uses today), so no new infrastructure is needed.

**Alternatives considered**:
- *Cormorant Garamond*: More delicate but too thin for body-weight food UI. Rejected.
- *Merriweather + Lato*: Solid pairing but lacks the warm editorial character Playfair brings.
- *DM Serif Display + DM Sans*: Clean pairing but feels more modern/tech than culinary.

### Colour Palette: Warm Spice Tones

| Token | Hex | Role |
|---|---|---|
| `--color-spice-red` | `#C0392B` | Primary brand accent, CTAs |
| `--color-saffron` | `#E67E22` | Secondary accent, highlights |
| `--color-turmeric` | `#F0A500` | Warm yellow, badge/tag fills |
| `--color-herb` | `#2E7D32` | Depth accent, labels, "fresh" signals |
| `--color-parchment` | `#FDF6EC` | Page backdrop |
| `--color-ink` | `#2C1A0E` | Primary text (warm near-black) |

**Rationale**: The palette is drawn from spice and pantry references (red chilli, saffron, turmeric, fresh herb) — immediately food-coded and distinct from the current neutral stone scale. Herb green is kept as an accent-only colour (≤10% visual weight) to add depth without clashing with the warm reds and yellows.

**Alternatives considered**:
- Pure CSS-level overrides without Tailwind tokens: rejected — would force all future UI work to use inline styles or arbitrary values.
- Full tailwind.config.js customisation: Tailwind v4 uses `@theme` in CSS; no separate config file needed.

### Backdrop: Parchment (`#FDF6EC`)

A warm cream that reads as natural parchment/paper. It has enough warmth to harmonise with saffron and turmeric without yellowing too aggressively. Contrast ratio with `--color-ink` (#2C1A0E) is ≥ 12:1, well above WCAG AA.

**Alternatives considered**:
- `#FAF3E0` (more golden): visually too warm on bright screens, risks looking dirty.
- `#FFF8F0` (barely-there peach): subtler, but loses the warmth differential versus white.

### Token Strategy: CSS Variables + Tailwind `@theme`

All palette entries are declared as CSS custom properties in `:root` for maximum portability (usable in inline styles, non-Tailwind contexts). They are simultaneously registered in the Tailwind `@theme inline` block as `--color-*` tokens, which Tailwind v4 automatically exposes as utility classes (`bg-spice-red`, `text-herb`, etc.).

Font variables follow the same pattern: `--font-display` and `--font-body` are set in `:root` via `next/font/google`'s `variable` prop, then referenced in `@theme`.

## Risks / Trade-offs

- **Existing stone-\* classes on pages**: Pages hard-code `text-stone-900`, `bg-white`, `border-stone-100`, etc. These are unaffected by the token change — they still resolve to Tailwind's built-in stone scale. A follow-up pass will be needed to migrate page-level colour usage to brand tokens. This is intentional scope-limiting.
- **Playfair Display renders heavier on Windows**: High-contrast serifs can look slightly bolder on Windows ClearType. Mitigation: `font-optical-sizing: auto` and `-webkit-font-smoothing: antialiased` (already set globally) reduce the effect.
- **Backdrop parchment vs. card whites**: Cards currently use `bg-white`. Against parchment backdrop, white cards will "pop" more — this is a desirable depth effect but worth noting.
- **Google Fonts dependency**: `next/font/google` self-hosts at build time; no runtime fetch to Google servers. No new latency risk.

## Migration Plan

1. Update `layout.tsx` — import `Playfair_Display` and `Nunito` from `next/font/google`; set CSS variables; remove Geist import.
2. Update `globals.css` — add `:root` palette variables, update `@theme` block with font and colour tokens, update `body` base styles to use `var(--font-body)` and `var(--color-parchment)`.
3. Verify locally: all pages load, fonts render, backdrop colour is correct.

**Rollback**: Revert both files to the previous Geist + stone-50 state. No database or API changes, so rollback is instant.
