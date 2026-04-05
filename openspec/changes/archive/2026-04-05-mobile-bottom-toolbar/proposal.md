## Why

On mobile devices, the existing top navigation is hard to reach with one hand and takes up valuable vertical space. A bottom toolbar is the standard mobile UX pattern (used by Instagram, Swiggy, Zomato) that keeps key actions within thumb reach — critical for a food storefront where quick menu browsing and cart access drive conversions.

## What Changes

- Add a fixed bottom toolbar component visible only on mobile (hidden on `md:` and above)
- Toolbar contains two actions: **Menu** (navigates to product listing) and **Cart** (opens cart or navigates to checkout)
- Cart icon shows a badge with current item count when cart has items
- Existing top navigation remains unchanged; bottom toolbar is additive

## Capabilities

### New Capabilities
- `mobile-bottom-toolbar`: Fixed bottom navigation bar for mobile viewports with Menu and Cart actions, cart item count badge, and responsive visibility (mobile-only)

### Modified Capabilities

## Impact

- `apps/web/src/components/` — new `MobileBottomToolbar.tsx` component
- `apps/web/src/app/(storefront)/layout.tsx` — toolbar injected into the storefront layout
- No API changes, no backend changes
- Tailwind CSS utility classes handle responsive visibility (`md:hidden`)
- Cart state must be accessible to the toolbar (depends on existing cart context/store)
