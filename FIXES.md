# FIXES — Repo audit (issues & optimizations)

This document captures known issues and improvement directions for the Pipeline-Assignment repo. It excludes `pipeline_prod.ipynb`, `model.sav`, and `shop.db` from scope.

---

## Critical / high impact

### 1. Keep Drizzle migrations in sync with `schema.ts`

**Status:** `0000_amazing_xavin.sql` covers Better Auth tables; `0001_shop_domain.sql` adds `customers`, `orders`, `products`, `order_items`, `shipments`, and `order_predictions`. If `schema.ts` changes, regenerate migrations from `web/` with `bunx drizzle-kit generate` and apply with `bun migrate`.

**Symptom if drift returns:** Queries fail or tables are missing after a fresh migrate.

---

### 2. `jobs/run_inference.py` (late delivery batch job)

**Status:** Implemented at `jobs/run_inference.py` with `jobs/requirements.txt` (pandas, scikit-learn, psycopg, python-dotenv). Trains a small model on shipment features, upserts into `order_predictions` for unfulfilled orders.

**Remaining constraint:** Scoring still does not run on Vercel (see item 3). Local/dev requires `pip install -r jobs/requirements.txt` before the UI button or CLI will succeed.

---

### 3. Scoring cannot work on Vercel as implemented

**Problem:** Even if the Python script existed:

- Serverless environments often lack Python or the expected runtime.
- There is no stable filesystem like a local dev machine.
- `child_process.exec` from a server action is a poor fit (timeouts, cold starts, no long-running ML workloads).

**Fix direction:** Move inference to a **background worker**, a **separate API** (e.g. container, dedicated Python host), or an approach that doesn’t shell out from the Vercel function. Keep server actions thin.

---

### 4. Supabase config references a missing seed file

**Problem:** `supabase/config.toml` sets `sql_paths = ["./seed.sql"]`, but **`supabase/seed.sql` is not present** in the repo.

**Symptom:** `supabase db reset` / local seeding may fail or behave unexpectedly.

**Fix direction:** Add `supabase/seed.sql` or remove/adjust the `sql_paths` entry in `config.toml`.

---

### 5. Better Auth is installed but not wired

**Problem:** There is no App Router API route (e.g. `app/api/.../route.ts`) exposing Better Auth, and no login UI. `web/lib/auth/index.ts` configures the server auth object, but nothing connects it to HTTP.

**Symptom:** Auth-related code is effectively unused; `BETTER_AUTH_SECRET` in `.env.example` has no completed integration.

**Fix direction:** Add the official Next.js route handler, set `baseURL` / `secret` per Better Auth docs, and optionally add sign-in UI—or remove the dependency if auth is out of scope.

---

## Security / product behavior

### 6. Customer identity is only a cookie

**Problem:** `selected_customer_id` is set from a form with **no authentication**. Users can change the cookie or submit another customer ID and view that customer’s data.

**Note:** Acceptable for a classroom demo; not acceptable for a real multi-tenant app.

**Fix direction:** Tie sessions to real auth and validate server-side that the user may act as that customer.

---

### 7. `exec` in a server action

**Problem:** Spawning a shell from a server action is risky if the command ever becomes user-influenced. Today the command is fixed, but the pattern is easy to misuse later.

**Fix direction:** Prefer dedicated workers or APIs; avoid `exec` in request paths for production.

---

## UX / polish

### 8. Default home page

**Problem:** `web/app/page.tsx` is still the stock Next.js starter content and doesn’t guide users to Select Customer / Dashboard.

**Fix direction:** Replace with links or a short landing aligned with the assignment flow.

---

### 9. Priority queue `INNER JOIN` on `order_predictions`

**Problem:** Unfulfilled orders **without** a row in `order_predictions` never appear in the priority list.

**Note:** May be intentional (only show scored orders). If not, use `LEFT JOIN` and handle null predictions in the UI.

---

## Quick checklist (remaining work)

1. Apply Drizzle migrations on any new database so **all** tables from `schema.ts` exist.
2. Seed or migrate data into Postgres (SQLite `shop.db` is not used by the Next app).
3. Fix or remove scoring until Python inference runs in a supported environment.
4. Add `supabase/seed.sql` or fix `config.toml` seed path.

---

## SQLite → Supabase data migration

**Context:** Migrations can run successfully on Supabase while the database stays empty. The next step is loading data from `shop.db` into Postgres. The Next app only uses Postgres (`web/lib/db/index.ts`); it never reads SQLite at runtime.

### Why this is not a raw dump

SQLite `shop.db` and `web/lib/db/schema.ts` (Postgres) **do not match column-for-column**. You need an **ETL** step: read SQLite, map or compute columns, then insert in FK-safe order.

| Area | SQLite `shop.db` | App / Drizzle (Postgres) |
|------|------------------|---------------------------|
| Customers | `full_name`, plus fields like `city`, `loyalty_tier`, … | `first_name`, `last_name`, `email`, `birthdate`, `gender` |
| Orders | `order_datetime`, `order_total`, `risk_score`, many others | `order_timestamp`, `fulfilled`, `num_items`, `total_value`, `avg_weight`, `late_delivery`, `is_fraud` |
| Products | `sku`, `category`, `cost`, no `weight` | `product_name`, `price`, `weight` (optional) |
| Order lines | PK `order_item_id` | Serial `id` |

### Suggested mapping (high level)

- **customers:** Split `full_name` into first/last (e.g. first token vs remainder); carry `email`, `birthdate`, `gender`.
- **products:** `product_name`, `price`; set `weight` to `NULL` unless derived elsewhere.
- **orders:** `order_datetime` → `order_timestamp`; `order_total` → `total_value`; `is_fraud` from SQLite; default `fulfilled` to `0`; `num_items` from aggregating `order_items` per order; `avg_weight` from joins if weights exist, else `NULL`; align `late_delivery` with `shipments` where applicable.
- **order_items:** Insert `order_id`, `product_id`, `quantity`, `unit_price`, `line_total`; let Postgres assign `id`.
- **shipments:** Copy carrier, method, distance, days, `late_delivery` (SQLite ties one shipment per order).
- **order_predictions:** Often empty until the scoring pipeline writes rows; optional for initial import.

**Insert order:** `customers` → `products` → `orders` → `order_items` / `shipments` → `order_predictions` (if any).

### How to run the import

- Implement a one-off script (Python: `sqlite3` + `psycopg` / `asyncpg`, or Node: `better-sqlite3` + `postgres`) on your machine with `DATABASE_URL` pointing at Supabase. For bulk load, a **direct** session URL is often used; the app can keep using the **pooler**.
- Alternatively, generating `supabase/seed.sql` still requires the same transforms; a script is usually simpler than hand-written SQL for this gap.

---

*Last updated: deployment (Vercel + env) is working; Drizzle domain migration noted; deployment/ops section removed.*
