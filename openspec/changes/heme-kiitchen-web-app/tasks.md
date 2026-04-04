## 1. Project Setup

- [x] 1.1 Initialise Next.js (App Router) project with TypeScript
- [x] 1.2 Initialise Express API project with TypeScript
- [x] 1.3 Set up monorepo structure (apps/web, apps/api, shared types package)
- [x] 1.4 Configure environment variables (.env.example) for: ADMIN_SECRET, API_BASE_URL, UPI ID, business WhatsApp number, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
- [x] 1.5 Add `/public/images/logo.*` placeholder structure (product images are stored on Cloudinary, not locally)
- [x] 1.6 Create `data/` directory with empty seed files: `products.json`, `orders.json`

## 2. Site Content — Data Layer

- [x] 2a.1 Define `SiteContent` TypeScript type — fields: tagline (string, max 150), description (string, max 500), highlights (string[], each max 80 chars), instagram_handle (string | null)
- [x] 2a.2 Implement `SiteContentRepository` with JSON file read/write (reads/writes `data/site-content.json`)
- [x] 2a.3 Add GET /api/site-content endpoint (public, returns current site content)
- [x] 2a.4 Add PATCH /api/site-content endpoint (admin-only; validates tagline non-empty and within 150 chars, description within 500 chars, each highlight within 80 chars; instagram_handle is optional, no validation required beyond string type)
- [x] 2a.5 Seed `data/site-content.json` with initial tagline, brand description, highlights, and instagram_handle set to null

## 3. Product Catalog — Data Layer

- [x] 2.1 Define `Product` TypeScript type (id, name, description, price, image_path, status) — no category or is_addon fields; flat catalogue
- [x] 2.2 Implement `ProductRepository` with JSON file read/write and atomic save
- [x] 2.3 Add GET /api/products endpoint (returns active products; supports include_inactive for admin)
- [x] 2.4 Add POST /api/products endpoint (admin-only, multipart/form-data; requires name, description, price, and image file; validate all fields present and image is a valid image type; upload image to Cloudinary, store returned CDN URL as image_path in product record)
- [x] 2.5 Add PATCH /api/products/:id endpoint (admin-only, multipart/form-data; supports updating name, description, price, status, and optionally image; validate name non-empty and price positive numeric; status accepts "active"/"inactive" only; if new image provided: upload to Cloudinary, delete old Cloudinary asset by stored public_id, update image_path to new CDN URL)
- [x] 2.6 Seed `products.json` with initial product catalogue — dips, falafel, lavash all as flat equal entries; no category or add-on classification

<!-- Section 3 (Inventory Data Layer) removed — inventory is deferred, managed manually for now -->

## 4. Order Management — Data Layer

- [x] 4.1 Define `Order` TypeScript type — fields: id, source, status, items, total_price, customer_name, phone, delivery_type, delivery_address (nullable), delivery_charges_applicable, payment_method, payment_status, special_instructions (nullable, max 500 chars), deleted, deleted_at (nullable), created_at, updated_at. No upi_reference field — payment handled offline via WhatsApp. Each item in `items` SHALL be `{ product_id, name, unit_price, quantity }` — name and unit_price are snapshots from the catalog at order creation time
- [x] 4.2 Implement `OrderRepository` with JSON file read/write, atomic append, and write lock
- [x] 4.3 Add POST /api/orders endpoint (creates order, validates items exist and are active, enforces payment method per delivery type — COD only for pickup, UPI only for home delivery, validates phone is a 10-digit Indian mobile number and stores as +91XXXXXXXXXX, snapshots name and unit_price from catalog into each order item at creation time, calculates total_price from snapshotted unit prices, no upi_reference field accepted, triggers order_placed WhatsApp notification after successful save)
- [x] 4.4 Add GET /api/orders endpoint with filters: source, status, payment_status, delivery_type, deleted
- [x] 4.5 Add GET /api/orders/:id endpoint
- [x] 4.6 Add PATCH /api/orders/:id endpoint — handles: accept (pending → confirmed), decline (pending → declined), status update, payment_status update, full field edit; enforce terminal state rules; after successful status update to confirmed/dispatched/completed/declined/cancelled, send WhatsApp notification to customer phone via WhatsApp Cloud API (failure logged, does not roll back status update)
- [x] 4.7 Add DELETE /api/orders/:id endpoint (soft delete — sets deleted=true, deleted_at=now)

## 4b. WhatsApp Notification Service
<!-- POST-DEMO: These tasks are not required for the demo. Complete after demo sign-off and once Meta business verification + template approval are in place. -->

- [x] 4b.1 Implement `WhatsAppService` — wraps WhatsApp Cloud API; accepts phone number, template name, and template variables; sends message; logs success/failure. **If `WHATSAPP_ACCESS_TOKEN` env var is not set, skip silently and log a warning — this allows the app to run without WhatsApp configured (e.g. during demo)**
- [ ] 4b.2 Define and submit Meta message templates for approval (4 templates):
  - **order_placed**: "Dear {{1}}, your order is placed."
  - **order_status_update**: "Dear {{1}}, your order status was {{2}}, and new status is {{3}}."
  - **order_completed**: "Dear {{1}}, your order status was {{2}}, and new status is {{3}}. Enjoy the indulgence."
  - **order_cancelled**: "Dear {{1}}, we regret to inform that your order is cancelled. We would love to have you back."
- [x] 4b.3 Integrate `WhatsAppService` into POST /api/orders — send order_placed template after order creation; catch and log errors without re-throwing
- [x] 4b.4 Integrate `WhatsAppService` into PATCH /api/orders/:id — send appropriate template after successful status update: order_status_update for confirmed/dispatched/declined, order_completed for completed, order_cancelled for cancelled; catch and log errors without re-throwing

## 5. Admin Authentication — API & Middleware

- [x] 5.1 Implement session-based auth middleware in Express (reads ADMIN_SECRET from env)
- [x] 5.2 Add POST /api/auth/login endpoint
- [x] 5.3 Add POST /api/auth/logout endpoint
- [x] 5.4 Protect all admin-only API routes with auth middleware

## 6. Customer Storefront — UI

- [x] 6.1 Build shared storefront layout — header with logo (links to homepage, appears on every page), nav links, cart icon; footer with FSSAI licence number and conditional Instagram link (renders @handle linking to instagram.com/[handle] only when instagram_handle is non-null in site-content)
- [x] 6.2 Build Homepage: fetch content from GET /api/site-content; render hero section with tagline, brand description, and highlights list dynamically; single "Order Now" CTA button linking to /products
- [x] 6.3 Build Products page: grid of product cards (image, name, description, price, "Add to Cart" button); cart icon in header showing item count
- [x] 6.4 Build About/Info page: brand story, FSSAI licence number, FSSAI certificate rendered inline via PDF.js (pdfjs-dist, self-hosted); no download button or link to raw PDF
- [ ] 6.5 Ensure all storefront pages pass mobile responsiveness check (375px viewport, no horizontal overflow)

## 7. Cart — UI

- [x] 7.1 Implement cart state using browser localStorage (product_id, name, unit_price snapshot, quantity)
- [x] 7.2 Build Cart page (/cart): list of cart items with image, name, unit price, quantity controls (+/−/remove), line totals, and overall order total; "Proceed to Checkout" button; empty cart message with link back to products
- [x] 7.3 Redirect to /products if customer navigates to /checkout with an empty cart

<!-- Platter Builder deferred — will be introduced in a future release alongside product classification/categories -->

## 8. Checkout — UI

- [x] 8.1 Build checkout page with order summary (items carried from cart via localStorage)
- [x] 8.2 Build delivery type selector (Pickup / Home Delivery); show conditional address field for home delivery; show pickup location for pickup; show live delivery charge notice (free above ₹1500, charge notice at or below)
- [x] 8.3 Build payment method selector — COD + UPI shown for pickup; UPI only for home delivery; switching delivery type to home delivery auto-selects UPI and hides COD; UPI selection shows a note: "After placing your order, contact us on WhatsApp with your Order ID to receive payment details." No transaction reference field.
- [x] 8.4 Build customer details form (name + phone always required; phone field labelled "Enter your WhatsApp number — order updates will be sent here", validated as 10-digit Indian mobile number, stored as +91XXXXXXXXXX; address required for home delivery only; optional special instructions textarea with live character counter, max 500 chars)
- [x] 8.5 Implement form validation with inline error messages
- [x] 8.6 Wire form submission to POST /api/orders; disable submit button during request
- [x] 8.7 Build order confirmation page — order ID displayed prominently; pickup: order ref + summary + "We will confirm your order via WhatsApp" + "To make any changes, contact us on WhatsApp with your Order ID"; home delivery: order ref + summary + delivery charge notice + "To complete your payment and confirm your order, contact us on WhatsApp at [business number] with your Order ID. You can request changes at this stage — payment collected only once order is finalised."; no cancel or modify buttons

## 9. Admin Panel — Orders

- [x] 9.0 Build shared admin layout — header with logo (appears on all /admin/* pages including login); mobile-first nav
- [x] 9.1 Build admin login page (logo above password form, error state)
- [x] 9.2 Implement client-side session guard (redirect to login if unauthenticated)
- [x] 9.3 Build admin order list page (all orders, filterable by status / source / payment_status / delivery_type; excludes deleted by default; show "Note" badge on cards where special_instructions is non-empty)
- [x] 9.4 Build order detail view — show all fields; highlighted "Chef Note" callout at top of view when special_instructions is non-empty; Accept + Decline actions for pending orders only; status update selector for confirmed+ orders; Cancel action for confirmed/preparing/dispatched; "Mark as Paid" action; Edit order fields (items, customer details, delivery type, address, payment method, special_instructions) for non-terminal orders
- [x] 9.5 Build create-offline-order form (customer details with phone labelled "Customer WhatsApp Number" validated as 10-digit Indian mobile number, delivery type selector, item picker from product catalog, payment method conditional on delivery type, optional special instructions textarea with live character counter, max 500 chars)
- [ ] 9.6 Verify all admin pages pass mobile layout check (375px viewport, 44px tap targets)

## 10. Admin Panel — Branding

- [x] 10a.1 Build admin branding page (/admin/branding) — form with tagline field (150 char limit + counter), brand description textarea (500 char limit + counter), highlights list (add / edit / remove individual items, each 80 char max), Instagram handle field (optional, plain text, no counter needed); save wires to PATCH /api/site-content; inline validation errors

## 12. Admin Panel — Products & Inventory

- [x] 10.1 Build admin products list page (all products including inactive, with status badge)
- [x] 10.2 Build add-product form (name, description, price, mandatory image upload with preview; block submission if no image selected; show validation errors inline) — no category or is_addon fields
- [x] 10.3 Build product edit form (name, description, price, optional photo replacement with current photo preview shown; deactivate/reactivate toggle); edits and photo replacements take effect immediately on storefront
<!-- 10.4–10.5 (Admin inventory page) removed — deferred until inventory tracking is plugged in -->

## 13. Integration & Polish

- [ ] 11.1 Wire storefront product images to actual dip photos (add files to /public/images/products/)
- [ ] 11.2 Add the brand logo to /public/images/ and update layout header
- [ ] 11.3 Add FSSAI certificate PDF to /public/ and verify it renders correctly via PDF.js on the about page (no download button shown)
- [ ] 11.4 Test full online order flow — pickup with COD (products page → cart → checkout → confirmation → admin accept → complete)
- [ ] 11.5 Test full online order flow — home delivery with UPI (checkout → WhatsApp payment instruction → admin receives screenshot → mark paid → accept → dispatch → complete)
- [ ] 11.6 Test admin decline flow on a pending order
- [ ] 11.7 Test offline order creation flow in admin panel (pickup + home delivery)
- [ ] 11.8 Test order edit and soft-delete from admin panel
- [x] 11.9 Write a short README with local dev setup instructions and asset update guide
