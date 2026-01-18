# OG Deliveries Backend

This backend provides admin login, pricing updates, and customer credit management.

## Quick start (local)

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Copy the example env file and update secrets:

   ```bash
   cp .env.example .env
   ```

3. Seed the first admin user:

   ```bash
   npm run seed
   ```

4. Start the API:

   ```bash
   npm run dev
   ```

The API listens on `http://localhost:4000` by default.

## Authentication

- `POST /auth/login`
  - Body: `{ "email": "...", "password": "..." }`
  - Returns: `{ "token": "..." }`

Include the token in requests:

```
Authorization: Bearer <token>
```

## Pricing endpoints

- `GET /pricing`
- `PUT /pricing`
  - Body: `{ "base_rate_cents": 800, "per_mile_cents": 250, "minimum_fee_cents": 1200 }`

## Customer + credit endpoints

- `GET /customers`
- `POST /customers`
  - Body: `{ "name": "Jane Doe", "email": "jane@example.com", "phone": "5551234567" }`
- `POST /credits`
  - Body: `{ "customer_id": 1, "delta_cents": 5000, "note": "Promo credit" }`

## Activity log

- `GET /activity`

## Notes

- The SQLite database is stored at `./data/og-deliveries.db` by default.
- Credits are stored in cents and can be positive or negative.
