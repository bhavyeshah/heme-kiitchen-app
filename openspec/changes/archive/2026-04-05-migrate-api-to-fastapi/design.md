## Context

The current API is Express 5 + TypeScript. It has 4 route modules (auth, products, orders, siteContent), a custom JSON file storage layer, Cloudinary integration for product images, and a WhatsApp notification service. The frontend shares types via a `packages/types` npm workspace. Admin auth uses `express-session` with an HTTP-only cookie.

The team is more comfortable with Python. The codebase is small (4 routes, ~15 endpoints, ~800 lines of TypeScript), making now the lowest-cost moment to migrate.

## Goals / Non-Goals

**Goals:**
- Replace `apps/api` entirely with a FastAPI + Python 3.12 application
- Preserve all existing API contracts (same paths, request/response shapes, status codes)
- Replace session auth with JWT so the auth model is stateless and Python-native
- Establish Pydantic v2 models as the single source of truth for domain types
- Wire up `openapi-typescript` codegen in `apps/web` to replace the retired `packages/types` workspace
- Keep `apps/web` changes minimal — only the type import paths and auth header change

**Non-Goals:**
- Changing any customer-facing or admin UI behaviour
- Migrating JSON file storage to a database (separate future concern)
- Adding new API endpoints or business logic
- Changing the deployment platform (Render stays)

## Decisions

### Framework: FastAPI over Flask / Django

**Chosen**: FastAPI.

**Rationale**: FastAPI is async-native (matches the async I/O pattern we already use for Cloudinary and WhatsApp calls), auto-generates OpenAPI 3.1 from Pydantic models with zero extra config, and has the best Python DX for building typed REST APIs. Flask requires manual schema generation; Django REST Framework carries more convention overhead than this project needs.

**Alternatives considered**:
- *Flask + marshmallow*: No automatic OpenAPI generation; manual schema work defeats the purpose.
- *Django REST Framework*: Significant boilerplate for a 4-resource API; ORM assumptions don't fit JSON file storage.

### Auth: JWT over server-side sessions

**Chosen**: JWT bearer tokens (`python-jose` + `passlib`).

**Rationale**: `express-session` has no clean Python equivalent without adding Redis or a database-backed session store. JWT is stateless — the token is self-contained, verified on every request, and needs no server-side storage. The admin is a single user; token revocation (logout) is handled by the client discarding the token. Token expiry is set to 7 days to match the previous session lifetime.

**Implications for the frontend**:
- `apps/web/src/lib/api.ts` must send `Authorization: Bearer <token>` on admin requests instead of `credentials: 'include'`
- Token is stored in `localStorage` on the admin client
- `GET /api/auth/me` is replaced by token decode on the client side (or kept as a lightweight verify endpoint)

**Alternatives considered**:
- *`starlette-session` with file-backed store*: Works but adds a stateful dependency and is non-standard.
- *HTTP-only cookie with JWT*: More secure against XSS but requires CSRF protection and complicates the fetch calls. Deferred to a future hardening pass.

### Type Sharing: Pydantic → OpenAPI → openapi-typescript

**Chosen**: FastAPI auto-generates `/openapi.json` from Pydantic models. `openapi-typescript` converts it to `apps/web/src/types/api.ts` at codegen time.

**Rationale**: This is the standard pattern for cross-language type sharing. FastAPI's OpenAPI output is accurate and complete because it is derived directly from the Pydantic models used for request/response validation — not handwritten.

**Codegen workflow**:
```bash
# Run after any API model change
cd apps/web
npm run gen:types   # calls: openapi-typescript http://localhost:4000/openapi.json -o src/types/api.ts
```

The generated file is committed to the repo so the frontend always has types even without a running API server.

**Alternatives considered**:
- *Handwrite TypeScript interfaces to match Pydantic models*: Error-prone, manual, defeats the purpose.
- *`datamodel-code-generator` (Python → TypeScript)*: Less accurate than FastAPI's built-in OpenAPI output.

### HTTP Client: httpx over requests

**Chosen**: `httpx` for the WhatsApp service.

**Rationale**: `httpx` is async-native and mirrors the `requests` API, making it familiar. Since FastAPI is async, using `httpx.AsyncClient` keeps the WhatsApp calls non-blocking — identical behaviour to the current Axios fire-and-forget pattern.

### Package Manager: Poetry

**Chosen**: Poetry with `pyproject.toml`.

**Rationale**: Poetry provides a lockfile (`poetry.lock`), virtual environment management, and clean dependency groups (main vs dev). Equivalent to the role `package-lock.json` plays in the Node side.

### File Structure

```
apps/api/
├── pyproject.toml          # Poetry config (replaces package.json + tsconfig.json)
├── poetry.lock
├── main.py                 # FastAPI app + startup
├── routers/
│   ├── auth.py             # POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
│   ├── products.py         # CRUD /api/products
│   ├── orders.py           # CRUD /api/orders
│   └── site_content.py     # GET+PATCH /api/site-content
├── models/
│   └── domain.py           # All Pydantic v2 models (Product, Order, SiteContent, etc.)
├── repositories/
│   ├── json_repo.py        # Atomic read/write (replaces JsonRepository.ts)
│   ├── product_repo.py
│   ├── order_repo.py
│   └── site_content_repo.py
├── services/
│   └── whatsapp.py         # httpx calls to Meta Graph API
└── middleware/
    └── auth.py             # JWT decode dependency (replaces requireAdmin middleware)
```

## Risks / Trade-offs

- **JWT in localStorage** → XSS risk: A script on the admin page could read the token. Mitigation: admin panel is a low-threat surface (not public-facing in practice); a future hardening pass can move to HTTP-only cookies with CSRF tokens.
- **Codegen discipline**: Developers must remember to run `npm run gen:types` and commit the result after API model changes. Without CI enforcement, types can drift. Mitigation: document the workflow clearly; add a CI check in a future pass.
- **Session invalidation**: JWTs cannot be revoked server-side before expiry. If the admin secret is compromised, the attacker's token remains valid for up to 7 days. Mitigation: keep token lifetime short (configurable); changing `ADMIN_SECRET` invalidates future logins even if old tokens remain valid temporarily.
- **Render cold starts**: Python + FastAPI starts slightly faster than Express + Node in practice on free tier. No regression expected.

## Migration Plan

1. Build and test the Python API locally against the existing `data/` JSON files
2. Run both APIs side-by-side locally to verify all endpoints return identical responses
3. Update `apps/web` — codegen workflow, auth header change, type import paths
4. Deploy the new Python API to Render (same service, updated build/start commands)
5. Smoke-test all flows in production (checkout, order status update, admin login, product upload)
6. Delete `packages/types` workspace and remove it from root `package.json`

**Rollback**: The old TypeScript API is in git history. Reverting `apps/api` to the previous commit and redeploying takes under 5 minutes.
