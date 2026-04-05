# Hémé Kiitchen — Tech Stack & Rationale

---

## Frontend — `apps/web`

### Next.js 16 (App Router)
**Rationale:** The App Router enables React Server Components — pages like the product listing fetch data directly on the server, so customers see fully rendered HTML with no loading spinners or waterfall requests. Route groups (`(storefront)` and `(admin)`) let the customer-facing site and the admin panel share a codebase while having completely separate layouts and navigation. Static generation for most pages means fast loads even on free hosting (Render).

### React 19
**Rationale:** Latest stable React. No legacy class components or old patterns to carry — clean foundation for future additions.

### TypeScript 5
**Rationale:** Shared types between the frontend and the FastAPI backend (via codegen) make it impossible for the two sides to drift apart silently. All domain models — `Order`, `Product`, `SiteContent` — are defined once in Pydantic on the API side, auto-generated into `src/types/api.ts` on the frontend, and re-exported from `src/types/index.ts`. Type errors surface at compile time, not at runtime in production.

### Tailwind CSS 4
**Rationale:** Tailwind 4 introduces `@theme inline` — design tokens live directly in `globals.css` as CSS custom properties, not in a separate config file. The brand palette (`spice-red`, `saffron`, `turmeric`, `herb`, `parchment`, `ink`) is defined once and available as utility classes (`bg-spice-red`, `text-ink`) everywhere. Less context switching, fewer files to maintain.

### Playfair Display + Nunito (via `next/font/google`)
**Rationale:** `next/font/google` self-hosts font files at build time — no runtime DNS lookups to Google's servers, no flash of invisible text, no GDPR concerns from third-party requests. Playfair Display (display serif) brings editorial warmth to headings; Nunito (rounded humanist sans) provides friendly readability for body text. Together they give the brand a culinary, artisanal identity distinct from generic tech-product aesthetics.

### PDF.js (`pdfjs-dist`)
**Rationale:** The About page embeds the FSSAI food-safety certificate inline for trust-building with customers. PDF.js renders it in a canvas element — no download prompt, no browser PDF viewer inconsistency, no iframes. The worker is loaded from `public/pdf.worker.min.mjs` so it works offline-first.

---

## Backend — `apps/api`

### Python 3.12
**Rationale:** The team is more comfortable with Python than TypeScript. Writing in your stronger language compounds over time — faster development, fewer bugs, lower cognitive overhead every day. Python was chosen over staying with TypeScript specifically because of team fluency, and because Python's ecosystem is the right foundation if ML/AI features are added later (demand forecasting, recommendations, etc.).

### FastAPI
**Rationale:** FastAPI is the right Python framework for this project for three reasons:

1. **Auto-generated OpenAPI schema.** FastAPI derives a complete OpenAPI 3.1 spec directly from the Pydantic models — no manual schema writing. This powers the `/docs` Swagger UI and, critically, the frontend type codegen workflow.
2. **Async-native.** FastAPI is built on Starlette and runs on ASGI. Cloudinary uploads and WhatsApp notifications are async operations; they run without blocking the event loop.
3. **Right-sized.** Flask requires manual schema generation. Django REST Framework carries ORM assumptions and convention overhead that don't fit a JSON-file-backed API with 4 resources. FastAPI hits the sweet spot.

### Pydantic v2
**Rationale:** Pydantic v2 is FastAPI's validation engine. Every request body is validated automatically — wrong types, missing fields, and constraint violations are caught before any business logic runs, and a structured 422 error is returned automatically. Pydantic models are also the single source of truth for domain types: they generate the OpenAPI schema, which generates the frontend TypeScript types.

### JWT Authentication (`python-jose`)
**Rationale:** The original Express backend used `express-session` with server-side sessions. Sessions have no clean Python equivalent without adding Redis or a database-backed store. JWT is stateless — the signed token is self-contained, verified on every request with no server-side lookup. For a single-admin use case, this is simpler and more portable. Token lifetime is 7 days (matching the previous session lifetime). Tokens are stored in `localStorage` on the admin client and sent as `Authorization: Bearer <token>`.

### JSON File Storage (custom `json_repo.py`)
**Rationale:** There is no database. Orders, products, and site content are stored as JSON files in `/data`. This was a deliberate choice for the current scale:
- **Zero infrastructure cost** — no managed database, no connection pooling, no migrations
- **Zero config** — files travel with the project; backups are a `git commit`
- **Atomic writes** — data is written to a `.tmp` file then `os.rename()`'d into place, so a crash mid-write never corrupts the file
- **Sufficient** — a small-batch artisanal brand doing tens to low-hundreds of orders per month does not need a database yet

`json_repo.py` is the only place that touches the filesystem, giving a single point to swap in a real database later without touching any router or service code.

### httpx
**Rationale:** `httpx` is the async-native Python HTTP client. It mirrors the `requests` API (familiar to any Python developer) but supports `async/await`. WhatsApp notifications use `httpx.AsyncClient` and are fired as background tasks (`asyncio.create_task`) — a WhatsApp API outage never blocks or fails a customer's checkout.

### Cloudinary Python SDK
**Rationale:** Same service as before, different SDK. Product images are uploaded from memory (no temp files on the server) directly to Cloudinary via the Python SDK's upload stream. The Cloudinary CDN URL and `public_id` are stored with the product — the URL serves images to customers, the `public_id` enables deletion when a product photo is replaced.

### Poetry
**Rationale:** Poetry provides a lockfile (`poetry.lock`), virtual environment management, and clean dependency groups (main vs dev). It is the Python equivalent of `package-lock.json` — deterministic installs across dev and production environments.

---

## Type Sharing — Pydantic → OpenAPI → TypeScript

This is the most architecturally important decision in the stack.

```
Pydantic models (FastAPI)
    ↓  auto-generates
GET /openapi.json
    ↓  openapi-typescript
apps/web/src/types/api.ts   ← generated, committed to repo
    ↓  re-exported by
apps/web/src/types/index.ts ← used by all frontend components
```

**Why this over alternatives:**
- *Handwritten TypeScript interfaces*: error-prone, drift-prone, maintenance burden
- *Shared TypeScript package (`packages/types`)*: only works when both sides are TypeScript — retired when we moved to Python
- *No types at all*: unacceptable — silent runtime failures in production

**Developer workflow:** After changing any Pydantic model, run `npm run gen:types` in `apps/web` (with the API running) and commit the updated `api.ts`. One command, takes under a second.

---

## Third-Party Integrations

### Cloudinary
**What:** Image CDN for all product photography.
**Why:** Serves images from a global CDN (fast for customers), handles image format optimisation, and removes the need to serve binary files from the API server. The Next.js `<Image>` component integrates natively with Cloudinary's `res.cloudinary.com` domain.

### Meta WhatsApp Cloud API
**What:** Automated transactional order notifications sent to customers' WhatsApp.
**Why:** WhatsApp is the dominant messaging platform in India — customers expect order updates there, not by email. Four message templates are in use: `order_placed`, `order_status_update`, `order_completed`, `order_cancelled`. All calls are non-blocking so a Meta outage never affects checkout.

### Google Fonts (via `next/font/google`)
**What:** Playfair Display and Nunito, self-hosted at build time.
**Why:** Zero runtime latency, no third-party network requests, GDPR-clean.

### Render
**What:** Cloud hosting for both the API and web app as separate web services.
**Why:** Free tier, zero-config deployments from git, supports both Python (ASGI/uvicorn) and Node.js (Next.js). Custom domain support. Sufficient for current traffic volume.

---

## Architecture Diagram

```
Browser
  │
  ├── GET pages ──────────────► apps/web (Next.js · Render)
  │                              Server Components fetch from API directly
  │                              Client Components use apiFetch() with JWT
  │
  └── apiFetch() ────────────► apps/api (FastAPI · Render)
                                 JWT auth (python-jose)
                                 Pydantic validation
                                 JSON file storage (/data)
                                   │
                                   ├──► Cloudinary  (image upload/delete/CDN)
                                   └──► Meta WhatsApp Cloud API  (notifications)

Type flow:
  Pydantic models → /openapi.json → openapi-typescript → src/types/api.ts → components
```
