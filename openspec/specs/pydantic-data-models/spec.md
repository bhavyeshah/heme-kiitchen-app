## Requirements

### Requirement: Pydantic v2 models cover all domain types
The system SHALL define Pydantic v2 `BaseModel` classes for all domain types: `Product`, `Order`, `OrderItem`, `SiteContent`, and all enums (`OrderStatus`, `DeliveryType`, `PaymentMethod`, `PaymentStatus`, `OrderSource`, `ProductStatus`). These models SHALL be the single source of truth used for request validation, response serialisation, and OpenAPI schema generation.

#### Scenario: Invalid request body is rejected with 422
- **WHEN** a request body fails Pydantic validation (e.g., missing required field, wrong type)
- **THEN** FastAPI returns HTTP 422 with a detailed validation error body

#### Scenario: Response body matches model schema
- **WHEN** any endpoint returns a domain object
- **THEN** the response JSON matches the fields and types defined in the corresponding Pydantic model

---

### Requirement: Price snapshot preserved in OrderItem
The system SHALL include `unit_price` and `name` as required fields on `OrderItem`, snapshotted from the product at order creation time, so historical orders are unaffected by future product price or name changes.

#### Scenario: Order item preserves price at creation time
- **WHEN** an order is created and the product price is later changed
- **THEN** the order's `items[].unit_price` still reflects the price at the time of order creation

---

### Requirement: OpenAPI schema generated from models
The system SHALL expose `GET /openapi.json` that returns a valid OpenAPI 3.1 schema derived automatically from the Pydantic models, with no manual schema authoring required.

#### Scenario: OpenAPI schema is reachable
- **WHEN** `GET /openapi.json` is called on the running API
- **THEN** the response is a valid JSON document with `openapi`, `info`, and `paths` keys
