## 1. MobileBottomToolbar Component

- [x] 1.1 Create `apps/web/src/components/MobileBottomToolbar.tsx` as a `'use client'` component
- [x] 1.2 Add Menu link (icon + label) navigating to `/products`
- [x] 1.3 Add Cart link (icon + label) navigating to `/cart`
- [x] 1.4 Implement cart item count state using `cart-updated` event (same pattern as `CartIcon`)
- [x] 1.5 Show badge on Cart icon when count > 0, hide when empty; cap display at 99+
- [x] 1.6 Style toolbar: fixed bottom, full width, white background, border-top, `md:hidden`, flex row with equal columns
- [x] 1.7 Add `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}` to the toolbar element for iOS safe area

## 2. Layout Integration

- [x] 2.1 Import and render `<MobileBottomToolbar />` in `apps/web/src/app/(storefront)/layout.tsx`
- [x] 2.2 Add `pb-16 md:pb-0` to the `<main>` element in the storefront layout so page content is not obscured by the toolbar on mobile
