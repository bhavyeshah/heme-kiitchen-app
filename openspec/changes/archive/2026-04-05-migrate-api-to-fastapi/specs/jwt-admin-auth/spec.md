## ADDED Requirements

### Requirement: Admin login issues a JWT
The system SHALL accept `POST /api/auth/login` with `{"password": "<string>"}`. If the password matches `ADMIN_SECRET`, it SHALL return `{"access_token": "<jwt>", "token_type": "bearer"}` with HTTP 200. The JWT SHALL be signed with `JWT_SECRET`, contain `{"sub": "admin", "exp": <unix timestamp>}`, and expire in 7 days.

#### Scenario: Correct password returns token
- **WHEN** `POST /api/auth/login` is called with the correct password
- **THEN** the response is HTTP 200 with a valid JWT in `access_token`

#### Scenario: Wrong password returns 401
- **WHEN** `POST /api/auth/login` is called with an incorrect password
- **THEN** the response is HTTP 401 with `{"error": "Invalid password"}`

---

### Requirement: Protected routes require valid Bearer token
The system SHALL provide a FastAPI dependency `require_admin` that extracts the `Authorization: Bearer <token>` header, verifies the JWT signature and expiry, and raises HTTP 401 if invalid or missing. All admin-only endpoints SHALL declare this dependency.

#### Scenario: Valid token grants access
- **WHEN** a request to an admin endpoint includes a valid unexpired JWT in the Authorization header
- **THEN** the request proceeds normally

#### Scenario: Missing token returns 401
- **WHEN** a request to an admin endpoint has no Authorization header
- **THEN** the response is HTTP 401

#### Scenario: Expired token returns 401
- **WHEN** a request includes a JWT whose `exp` claim is in the past
- **THEN** the response is HTTP 401

---

### Requirement: Logout endpoint clears client token
The system SHALL accept `POST /api/auth/logout` and return `{"success": true}` with HTTP 200. Since JWTs are stateless, logout is a client-side operation; the endpoint exists for API symmetry and frontend compatibility.

#### Scenario: Logout always succeeds
- **WHEN** `POST /api/auth/logout` is called with or without a token
- **THEN** the response is HTTP 200 with `{"success": true}`

---

### Requirement: Session check endpoint
The system SHALL accept `GET /api/auth/me` with a Bearer token and return `{"isAdmin": true}` if the token is valid, or `{"isAdmin": false}` if not — without raising an error. This preserves frontend compatibility with the existing session check.

#### Scenario: Valid token returns isAdmin true
- **WHEN** `GET /api/auth/me` is called with a valid JWT
- **THEN** the response is `{"isAdmin": true}`

#### Scenario: No token returns isAdmin false
- **WHEN** `GET /api/auth/me` is called without a token
- **THEN** the response is `{"isAdmin": false}` with HTTP 200 (not 401)
