## ADDED Requirements

### Requirement: FastAPI application serves all existing API routes
The system SHALL expose all existing REST endpoints under the same paths and HTTP methods as the Express API, using FastAPI routers registered on a single `FastAPI` app instance.

#### Scenario: Health check responds
- **WHEN** `GET /api/health` is called
- **THEN** the response is `{"status": "ok"}` with HTTP 200

#### Scenario: All route prefixes are preserved
- **WHEN** any request is made to `/api/products`, `/api/orders`, `/api/auth`, or `/api/site-content`
- **THEN** the FastAPI router handles it identically to the Express equivalent

---

### Requirement: CORS configured for web app origin
The system SHALL configure CORS middleware to allow requests from `WEB_URL` (env var, default `http://localhost:3000`) with credentials support.

#### Scenario: CORS headers present on API response
- **WHEN** a request arrives from the configured `WEB_URL` origin
- **THEN** the response includes `Access-Control-Allow-Origin` matching that origin

---

### Requirement: Environment variables loaded at startup
The system SHALL load all configuration from environment variables via a `.env` file in `apps/api/` using `python-dotenv`. Required vars: `ADMIN_SECRET`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WEB_URL`, `PORT`.

#### Scenario: Missing optional vars log a warning but do not crash
- **WHEN** `WHATSAPP_ACCESS_TOKEN` is not set
- **THEN** the server starts successfully and WhatsApp notifications are skipped with a log warning

---

### Requirement: Atomic JSON file writes preserved
The system SHALL write JSON data files atomically — writing to a `.tmp` file then renaming — to prevent data corruption on crash.

#### Scenario: Write does not corrupt file on incomplete write
- **WHEN** `write_json()` is called with new data
- **THEN** the target file is only replaced after the full content is written to the temp file
