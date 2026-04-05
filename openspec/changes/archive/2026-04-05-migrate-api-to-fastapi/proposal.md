## Why

The team is more comfortable with Python than TypeScript, and the codebase is still small enough to migrate cheaply. Doing this now — before traffic, before more features, before entrenched habits — avoids compounding cost: every future feature built in the wrong language is more migration work later.

## What Changes

- **BREAKING** — `apps/api` is replaced entirely: Express 5 + TypeScript → FastAPI + Python 3.12
- `apps/api/src/` (all TypeScript) is deleted and replaced with a new Python package structure
- `apps/api/package.json`, `tsconfig.json`, and all Node dependencies are removed; a `pyproject.toml` (Poetry) is added
- `packages/types` shared TypeScript workspace is retired; Pydantic v2 models on the API become the source of truth for types
- `apps/web` gains an OpenAPI codegen step: FastAPI auto-generates `/openapi.json`; `openapi-typescript` generates `src/types/api.ts` from it — frontend types are now codegen-derived instead of directly imported
- `express-session` cookie auth → JWT bearer tokens (`python-jose`): the admin login endpoint issues a signed JWT; the frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on admin requests
- `multer` (file upload buffering) → FastAPI `UploadFile` (built-in)
- Cloudinary Node SDK → Cloudinary Python SDK (same operations, different SDK)
- `axios` (WhatsApp HTTP calls) → `httpx` (async Python HTTP client)
- All business logic, validation rules, route paths, and JSON file storage behaviour are preserved exactly

## Capabilities

### New Capabilities
- `fastapi-api-server`: The FastAPI application — app entry point, CORS, middleware, route registration, and server startup
- `jwt-admin-auth`: JWT-based admin authentication replacing the session cookie approach — login, token issuance, and bearer token middleware
- `pydantic-data-models`: Pydantic v2 models for all domain types (Product, Order, SiteContent, etc.) that serve as the API's type system and drive OpenAPI schema generation
- `openapi-type-codegen`: Workflow for generating TypeScript types in `apps/web` from the FastAPI OpenAPI spec using `openapi-typescript`

### Modified Capabilities
<!-- No existing spec-level behaviour changes — all customer-facing and admin API contracts remain identical. The culinary-theme spec is unaffected. -->

## Impact

- `apps/api/` — complete rewrite; all `.ts` files replaced with `.py` files
- `packages/types/` — retired; consumers in `apps/web` updated to import from generated `src/types/api.ts`
- `apps/web/src/lib/api.ts` — `Authorization` header added for admin requests (JWT instead of session cookie + `credentials: 'include'`)
- `apps/web/` — new codegen script added to `package.json`; generated types file committed
- `root package.json` — `packages/types` workspace removed; Poetry workspace not added (Python project manages itself)
- Render deployment config — API service build/start commands updated for Python/Poetry
- All API endpoint paths, request shapes, response shapes, and status codes remain unchanged
