# Spec: mobile-bottom-toolbar

## Requirements

### Requirement: Mobile-only bottom toolbar is visible
The system SHALL render a fixed bottom toolbar on viewport widths below the `md` breakpoint (< 768px) and hide it on `md` and above.

#### Scenario: Toolbar visible on mobile
- **WHEN** the viewport width is less than 768px
- **THEN** the bottom toolbar is visible and fixed to the bottom of the screen

#### Scenario: Toolbar hidden on desktop
- **WHEN** the viewport width is 768px or greater
- **THEN** the bottom toolbar is not rendered or hidden (display: none)

---

### Requirement: Toolbar contains Menu and Cart navigation items
The toolbar SHALL contain exactly two items: a Menu link navigating to `/products` and a Cart link navigating to `/cart`. Each item SHALL display an icon and a text label.

#### Scenario: Menu item navigates to products
- **WHEN** the user taps the Menu item in the bottom toolbar
- **THEN** the user is navigated to `/products`

#### Scenario: Cart item navigates to cart
- **WHEN** the user taps the Cart item in the bottom toolbar
- **THEN** the user is navigated to `/cart`

---

### Requirement: Cart item shows live item count badge
The Cart item in the toolbar SHALL display a badge showing the total quantity of items in the cart. The badge SHALL update in real time when cart contents change. The badge SHALL be hidden when the cart is empty.

#### Scenario: Badge hidden when cart is empty
- **WHEN** the cart contains zero items
- **THEN** no badge is displayed on the Cart toolbar item

#### Scenario: Badge shows correct count
- **WHEN** the cart contains one or more items
- **THEN** a badge displaying the total quantity is shown on the Cart toolbar item

#### Scenario: Badge updates on cart change
- **WHEN** the user adds or removes an item from the cart
- **THEN** the badge count updates without a page reload

---

### Requirement: Toolbar does not obscure page content
The storefront layout SHALL add bottom padding on mobile equal to the toolbar height so that page content scrolls fully above the toolbar.

#### Scenario: Content not hidden behind toolbar
- **WHEN** the user scrolls to the bottom of any storefront page on mobile
- **THEN** all page content is visible above the bottom toolbar

---

### Requirement: Toolbar respects iOS safe area
The toolbar SHALL apply `env(safe-area-inset-bottom)` as additional bottom padding to avoid overlapping the iOS home indicator.

#### Scenario: Safe area padding applied on iOS
- **WHEN** the page is viewed on a device with a home indicator (iPhone X and later)
- **THEN** the toolbar sits above the home indicator with appropriate spacing
