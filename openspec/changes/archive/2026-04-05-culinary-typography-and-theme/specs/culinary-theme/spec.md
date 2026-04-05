## ADDED Requirements

### Requirement: Display font applied to headings
The system SHALL load Playfair Display (serif) via `next/font/google` and expose it as the `--font-display` CSS variable. The `@theme` block SHALL register it as `--font-display` so Tailwind's `font-display` utility class is available.

#### Scenario: Display font CSS variable is defined
- **WHEN** the page renders
- **THEN** `--font-display` resolves to the Playfair Display font stack

#### Scenario: Tailwind font-display utility is usable
- **WHEN** a class `font-display` is applied to any element
- **THEN** the element renders in Playfair Display

---

### Requirement: Body font applied globally
The system SHALL load Nunito (sans-serif) via `next/font/google` and expose it as the `--font-body` CSS variable. The `body` base style SHALL use `var(--font-body)` as its font-family.

#### Scenario: Body font CSS variable is defined
- **WHEN** the page renders
- **THEN** `--font-body` resolves to the Nunito font stack

#### Scenario: Default body text uses Nunito
- **WHEN** any page is rendered without an explicit font class
- **THEN** body text renders in Nunito

---

### Requirement: Brand colour palette defined as CSS variables
The system SHALL define the following CSS custom properties in `:root`:

| Variable | Hex |
|---|---|
| `--color-spice-red` | `#C0392B` |
| `--color-saffron` | `#E67E22` |
| `--color-turmeric` | `#F0A500` |
| `--color-herb` | `#2E7D32` |
| `--color-parchment` | `#FDF6EC` |
| `--color-ink` | `#2C1A0E` |

#### Scenario: Palette variables are present on :root
- **WHEN** the page loads
- **THEN** each of the six `--color-*` variables is resolvable via `getComputedStyle(document.documentElement)`

---

### Requirement: Tailwind colour tokens registered for brand palette
The system SHALL register all six brand colours in the Tailwind `@theme inline` block so that utility classes (`bg-spice-red`, `text-saffron`, `border-herb`, etc.) are generated.

#### Scenario: Tailwind brand utilities are usable
- **WHEN** a class such as `bg-parchment` or `text-spice-red` is applied to an element
- **THEN** the element renders with the corresponding brand colour

---

### Requirement: Parchment backdrop applied to page body
The system SHALL set the `body` background to `var(--color-parchment)` (`#FDF6EC`) and the default text colour to `var(--color-ink)` (`#2C1A0E`). The `<body>` className in `layout.tsx` SHALL reference the Tailwind `bg-parchment` and `text-ink` tokens.

#### Scenario: Page backdrop is warm parchment
- **WHEN** any storefront page is loaded
- **THEN** the background colour of `<body>` is `#FDF6EC` (not white or stone-50)

#### Scenario: Default text is warm near-black
- **WHEN** any storefront page is loaded
- **THEN** the default text colour of `<body>` is `#2C1A0E`

---

### Requirement: WCAG AA contrast maintained
The `--color-ink` on `--color-parchment` combination SHALL achieve a contrast ratio of at least 4.5:1 (WCAG AA for normal text).

#### Scenario: Text contrast passes WCAG AA
- **WHEN** `#2C1A0E` text is rendered on `#FDF6EC` background
- **THEN** the contrast ratio is ≥ 4.5:1
