## 1. Update layout.tsx — Font Imports

- [x] 1.1 Remove the `Geist` import from `apps/web/src/app/layout.tsx`
- [x] 1.2 Add `Playfair_Display` import from `next/font/google` with `variable: "--font-playfair-display"` and `subsets: ["latin"]`
- [x] 1.3 Add `Nunito` import from `next/font/google` with `variable: "--font-nunito"` and `subsets: ["latin"]`
- [x] 1.4 Update the `<html>` className to include both font variable classes (`${playfairDisplay.variable} ${nunito.variable}`)
- [x] 1.5 Update the `<body>` className to use `bg-parchment text-ink` instead of `bg-stone-50 text-stone-900`

## 2. Update globals.css — Palette Tokens

- [x] 2.1 Add all six brand colour variables to `:root`: `--color-spice-red`, `--color-saffron`, `--color-turmeric`, `--color-herb`, `--color-parchment`, `--color-ink`
- [x] 2.2 Replace `--background` / `--foreground` variables in `:root` with the new `--color-parchment` and `--color-ink` values (or map them to the new tokens)
- [x] 2.3 Register all six colours in the `@theme inline` block so Tailwind generates `bg-*`, `text-*`, `border-*` utilities for each brand token
- [x] 2.4 Register `--font-display` and `--font-sans` in the `@theme inline` block (replacing `--font-sans: var(--font-geist)`)
- [x] 2.5 Update the `body` base style to use `font-family: var(--font-sans, Arial, sans-serif)` and `background: var(--color-parchment)` and `color: var(--color-ink)`

## 3. Verify & Test

- [x] 3.1 Run the dev server (`pnpm dev` or `npm run dev`) and confirm pages load without errors
- [x] 3.2 Confirm the page backdrop is warm parchment (`#FDF6EC`), not white
- [x] 3.3 Confirm body text renders in Nunito
- [x] 3.4 Apply `font-display` to a heading element temporarily and confirm Playfair Display renders
- [x] 3.5 Apply `bg-spice-red` to an element temporarily and confirm the brand red renders correctly
- [x] 3.6 Verify browser DevTools shows `--color-ink` on `--color-parchment` contrast ≥ 4.5:1
