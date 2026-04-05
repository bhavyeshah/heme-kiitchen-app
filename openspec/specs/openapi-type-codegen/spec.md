## Requirements

### Requirement: openapi-typescript generates frontend types from FastAPI spec
The system SHALL include `openapi-typescript` as a dev dependency in `apps/web`. A `gen:types` script in `apps/web/package.json` SHALL call `openapi-typescript` against the running API's `/openapi.json` and write the output to `apps/web/src/types/api.ts`.

#### Scenario: Codegen script produces a TypeScript types file
- **WHEN** the API is running locally and `npm run gen:types` is executed in `apps/web`
- **THEN** `apps/web/src/types/api.ts` is created or updated with TypeScript interfaces matching the Pydantic models

---

### Requirement: Generated types file is committed to the repository
The system SHALL commit `apps/web/src/types/api.ts` to version control so that the frontend has types available without needing a running API server (e.g., in CI builds).

#### Scenario: Frontend builds without a running API
- **WHEN** `npm run build` is executed in `apps/web` without a running API server
- **THEN** the build succeeds because `src/types/api.ts` is already present in the repo

---

### Requirement: packages/types workspace is retired
The system SHALL remove the `packages/types` directory and its entry from the root `package.json` workspaces array. All imports of types in `apps/web` that previously came from `@heme-kiitchen/types` or `@/types` pointing to `packages/types` SHALL be updated to import from the generated `src/types/api.ts`.

#### Scenario: No imports reference the retired types package
- **WHEN** the codebase is searched for imports from `packages/types` or `@heme-kiitchen/types`
- **THEN** no matches are found in `apps/web/src`

---

### Requirement: Admin API calls send Bearer token instead of session cookie
The system SHALL update `apps/web/src/lib/api.ts` so that admin requests include an `Authorization: Bearer <token>` header using the JWT stored in `localStorage`, replacing the `credentials: 'include'` cookie approach.

#### Scenario: Admin fetch includes Authorization header
- **WHEN** an admin-authenticated fetch is made
- **THEN** the request includes `Authorization: Bearer <token>` with the stored JWT

#### Scenario: Unauthenticated fetch omits Authorization header
- **WHEN** a public fetch is made (no token in localStorage)
- **THEN** no Authorization header is sent
