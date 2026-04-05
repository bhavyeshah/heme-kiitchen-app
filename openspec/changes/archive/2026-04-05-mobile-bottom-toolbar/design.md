## Context

The storefront currently has a sticky top header (`StorefrontHeader`) with Menu, About, and Cart links. On mobile this works but the header is at the top of the screen — far from the thumb zone. A bottom toolbar is the standard pattern for mobile-first food apps.

The cart state already uses a `cart-updated` custom DOM event pattern (see `CartIcon.tsx`) — the toolbar can reuse the exact same approach without needing a global state library.

## Goals / Non-Goals

**Goals:**
- Add a fixed bottom toolbar visible only on mobile (`md:hidden`)
- Two tappable items: Menu (→ `/products`) and Cart (→ `/cart`) with item count badge
- Reuse the existing `cart-updated` event pattern for live cart count
- Keep the existing top header fully intact

**Non-Goals:**
- Not replacing the top header on any breakpoint
- Not adding more than two items to the toolbar (About link is secondary, not a core action)
- No animation or slide-in/out behavior
- No changes to cart logic or backend

## Decisions

**1. New `MobileBottomToolbar` client component — not extending `CartIcon`**
CartIcon is a self-contained link+badge. The toolbar needs two items with labels plus safe-area padding. Extracting a shared badge primitive would add complexity for one consumer. A single focused component is simpler.

**2. `md:hidden` for visibility**
Tailwind's `md:` breakpoint (768px) is the established mobile/desktop boundary already used in `StorefrontHeader` (`hidden sm:inline` for the brand name). `md:hidden` hides the toolbar on tablet and desktop.

**3. `pb-safe` / `padding-bottom: env(safe-area-inset-bottom)` for iOS home bar**
Without this the toolbar overlaps the iOS home indicator. We add inline style `paddingBottom: 'env(safe-area-inset-bottom)'` since Tailwind 4 doesn't have a built-in safe-area utility yet.

**4. Add `pb-16 md:pb-0` to storefront layout body**
The fixed toolbar overlaps page content at the bottom. Adding bottom padding to `<main>` on mobile prevents content from being hidden behind the toolbar.

**5. Cart count via `cart-updated` event — same as `CartIcon`**
Avoids introducing a context/store for a single badge. The pattern is already established and working.

## Risks / Trade-offs

- **Safe area on Android**: `env(safe-area-inset-bottom)` is `0` on most Android devices — no harm, just no extra padding. Fine.
- **Content overlap**: If any page has a sticky bottom CTA button, it could conflict. Currently no such page exists in the storefront.
- **Duplication of cart badge logic**: Both `CartIcon` and `MobileBottomToolbar` independently subscribe to `cart-updated`. Minor duplication, acceptable given the simplicity — extracting a hook can be done later if a third consumer appears.
