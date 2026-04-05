## 1. Project Setup

- [x] 1.1 Delete `apps/api/src/`, `apps/api/package.json`, `apps/api/package-lock.json`, `apps/api/tsconfig.json`, and `apps/api/node_modules/`
- [x] 1.2 Initialise Poetry in `apps/api/`: run `poetry init` and set Python `^3.12`
- [x] 1.3 Add production dependencies: `poetry add fastapi uvicorn[standard] python-jose[cryptography] passlib[bcrypt] cloudinary httpx python-dotenv python-multipart`
- [x] 1.4 Add dev dependencies: `poetry add --group dev pytest httpx`
- [x] 1.5 Create `apps/api/.env` from the existing env vars (copy `ADMIN_SECRET`, `SESSION_SECRET` → rename to `JWT_SECRET`, `CLOUDINARY_*`, `WHATSAPP_*`, `WEB_URL`, `PORT`)
- [x] 1.6 Create the directory structure: `apps/api/routers/`, `apps/api/models/`, `apps/api/repositories/`, `apps/api/services/`, `apps/api/middleware/`

## 2. Pydantic Models

- [x] 2.1 Create `apps/api/models/domain.py` with all enums: `OrderStatus`, `DeliveryType`, `PaymentMethod`, `PaymentStatus`, `OrderSource`, `ProductStatus`
- [x] 2.2 Add `SiteContent` Pydantic model to `domain.py`
- [x] 2.3 Add `Product` and `ProductStatus` Pydantic models to `domain.py`
- [x] 2.4 Add `OrderItem`, `Order`, `CreateOrderPayload`, `PatchOrderPayload` Pydantic models to `domain.py`

## 3. JSON Repository Layer

- [x] 3.1 Create `apps/api/repositories/json_repo.py` with `read_json(filename)` and `write_json(filename, data)` — atomic write via `.tmp` + `os.rename()`
- [x] 3.2 Create `apps/api/repositories/product_repo.py` with `find_all()`, `find_active()`, `find_by_id()`, `create()`, `update()`
- [x] 3.3 Create `apps/api/repositories/order_repo.py` with `find_all()`, `find_by_id()`, `create()`, `update()`
- [x] 3.4 Create `apps/api/repositories/site_content_repo.py` with `get()` and `update()`

## 4. Auth Middleware & JWT

- [x] 4.1 Create `apps/api/middleware/auth.py` with `create_access_token(data, expires_delta)` using `python-jose`
- [x] 4.2 Add `require_admin` FastAPI dependency to `auth.py` — extracts and verifies Bearer token, raises HTTP 401 on failure
- [x] 4.3 Add `get_optional_admin` dependency — returns `True`/`False` without raising (used by `GET /api/auth/me`)

## 5. Routers

- [x] 5.1 Create `apps/api/routers/auth.py` — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [x] 5.2 Create `apps/api/routers/site_content.py` — `GET /api/site-content`, `PATCH /api/site-content` (admin)
- [x] 5.3 Create `apps/api/routers/products.py` — `GET /api/products`, `GET /api/products/{id}`, `POST /api/products` (admin, with `UploadFile`), `PATCH /api/products/{id}` (admin, with optional `UploadFile`)
- [x] 5.4 Create `apps/api/routers/orders.py` — `GET /api/orders` (admin), `GET /api/orders/{id}` (admin), `POST /api/orders` (public), `PATCH /api/orders/{id}` (admin), `DELETE /api/orders/{id}` (admin, soft delete)
- [x] 5.5 Port all order business logic to `orders.py`: phone validation, Indian phone normalisation (`+91`), COD/UPI delivery type rules, price snapshotting, delivery charge calculation, terminal status guard, status machine rules

## 6. WhatsApp Service

- [x] 6.1 Create `apps/api/services/whatsapp.py` with `send_template()`, `send_order_placed()`, `send_order_status_update()`, `send_order_completed()`, `send_order_cancelled()` using `httpx.AsyncClient`
- [x] 6.2 Ensure all WhatsApp calls are fire-and-forget (use `asyncio.create_task` or background tasks) so failures never affect HTTP responses

## 7. Cloudinary Integration

- [x] 7.1 Create `apps/api/services/cloudinary_service.py` with `upload_image(file_bytes, mime_type)` → `(url, public_id)` and `delete_image(public_id)` using the Cloudinary Python SDK
- [x] 7.2 Wire Cloudinary upload into `POST /api/products` and replace-image path in `PATCH /api/products/{id}`
- [x] 7.3 Wire Cloudinary delete into `PATCH /api/products/{id}` when replacing an image (delete the old `public_id`)

## 8. FastAPI App Entry Point

- [x] 8.1 Create `apps/api/main.py` — instantiate `FastAPI`, add `CORSMiddleware` (from `WEB_URL` env var), register all four routers with `/api` prefix, add `GET /api/health`
- [x] 8.2 Verify `uvicorn main:app --reload` starts the server and `GET /api/health` returns `{"status": "ok"}`
- [x] 8.3 Confirm `GET /openapi.json` returns a valid schema with all routes and Pydantic models reflected

## 9. Frontend — Type Codegen

- [x] 9.1 Add `openapi-typescript` as a dev dependency in `apps/web`: `npm install --save-dev openapi-typescript`
- [x] 9.2 Add `"gen:types": "openapi-typescript http://localhost:4000/openapi.json -o src/types/api.ts"` to `apps/web/package.json` scripts
- [x] 9.3 Run `npm run gen:types` with the FastAPI server running to generate `apps/web/src/types/api.ts`
- [x] 9.4 Commit `apps/web/src/types/api.ts` to the repository

## 10. Frontend — Auth & Type Import Updates

- [x] 10.1 Update `apps/web/src/lib/api.ts` — replace `credentials: 'include'` with `Authorization: Bearer <token>` header logic using a token from `localStorage`
- [x] 10.2 Add `getToken()` and `setToken()` / `clearToken()` helpers to `apps/web/src/lib/api.ts`
- [x] 10.3 Update the admin login page to store the JWT from the login response into `localStorage` and redirect
- [x] 10.4 Update the admin logout action to call `clearToken()` and redirect to login
- [x] 10.5 Update all type imports across `apps/web/src` — `src/types/index.ts` now re-exports from generated `api.ts`; all `@/types` imports unchanged
- [x] 10.6 Remove `packages/types/` directory
- [x] 10.7 Remove `packages/types` from the `workspaces` array in the root `package.json`

## 11. End-to-End Verification

- [x] 11.1 Start both `apps/api` (FastAPI) and `apps/web` (Next.js) locally — confirm no startup errors
- [x] 11.2 Place a test order as a customer — confirm `order_placed` WhatsApp notification fires (or logs a skip if token not set)
- [x] 11.3 Log in to the admin panel — confirm JWT is stored and admin routes are accessible
- [x] 11.4 Update an order status — confirm appropriate WhatsApp notification fires
- [x] 11.5 Upload a product with a new image via admin — confirm Cloudinary upload succeeds and image appears in storefront
- [x] 11.6 Replace a product image — confirm old Cloudinary asset is deleted and new one appears
- [x] 11.7 Log out — confirm token is cleared and admin routes return 401

## 12. Deployment

- [x] 12.1 Update the API service build command on Render: `pip install poetry && poetry install --no-dev`
- [x] 12.2 Update the API service start command on Render: `poetry run uvicorn main:app --host 0.0.0.0 --port $PORT`
- [x] 12.3 Update Render environment variables: rename `SESSION_SECRET` → `JWT_SECRET`; keep all others as-is
- [x] 12.4 Deploy and run production smoke tests: health check, storefront load, admin login, order placement
