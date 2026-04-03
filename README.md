# Pipeline-Assignment

Next.js app lives in **`web/`**. Postgres is **Supabase** (local via Docker, or hosted for production). Shop data starts in **`shop.db`** (SQLite) and is loaded into Postgres with the ETL script under **`scripts/`**.

## Prerequisites

- **Docker Desktop** (running) — required for local Supabase
- **Supabase CLI** — [install](https://supabase.com/docs/guides/cli/getting-started)

  Windows (Scoop):

  ```
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  macOS:

  ```
  brew install supabase/tap/supabase
  ```

- **Bun** or **Node** — for installing and running the app (`bun` recommended; use `npm` / `npx` if you do not use Bun)
- **Python 3** + **pip** — for one-time SQLite → Postgres import

## Local development

From the repository root:

1. **Install JS dependencies** (must be inside `web/`):

   ```
   cd web
   bun i
   ```

2. **Start local Supabase** (Postgres, Studio, etc.):

   ```
   bun run dev:up
   ```

   Confirm with `supabase status`. The default DB URL is:

   `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

3. **Configure the app** — in `web/.env` set:

   ```
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
   ```

   (Add other vars from `.env.example` if you use them.)

4. **Apply database migrations** (creates auth + shop tables):

   ```
   cd web
   npx drizzle-kit migrate
   ```

   If you use Bun: `bun run migrate` (runs `drizzle-kit migrate`).

5. **Load `shop.db` into Postgres** (one-time per machine / DB):

   ```
   cd ..
   pip install -r scripts/requirements-etl.txt
   python scripts/import_sqlite_to_pg.py
   ```

   Set `DATABASE_URL` in the shell to the same value as `web/.env` if it is not already exported.

6. **Run the Next app**:

   ```
   cd web
   bun dev
   ```

   Open **http://localhost:3000/select-customer** (the default home page is still the stock Next starter). Supabase Studio: **http://127.0.0.1:54323**

## Production (Vercel + hosted Supabase)

Only **two things** must point at your **hosted** Supabase database: **Vercel’s env var** and the **commands you run once** to migrate + import. Your local `web/.env` can stay on `127.0.0.1` if you use the PowerShell method below.

### A. What to change (checklist)

| # | Where | Exactly what |
|---|--------|----------------|
| 1 | **Supabase dashboard** | Nothing in the repo. Copy the DB URL: **Project Settings → Database → Connection string** → tab **URI** → use the **Transaction pooler** string (host ends in `pooler.supabase.com`, port **6543**). If something fails later, add **`?sslmode=require`** at the end of the URL. |
| 2 | **Vercel** → your project → **Settings → General** | **Root Directory** = **`web`** (not the repo root). |
| 3 | **Vercel** → **Settings → Environment Variables** | **Name:** `DATABASE_URL` — **Value:** paste that same Supabase pooler URL. **Environment:** Production (and Preview if you want previews to use prod DB). |
| 4 | **Redeploy** | After saving env vars, trigger a new deployment (Deployments → … → Redeploy) so the build sees `DATABASE_URL`. |

That’s all Vercel needs. The app reads `process.env.DATABASE_URL` at runtime (see `web/lib/db/index.ts`).

### B. One-time: create tables + load data on the **hosted** DB

The live site will be empty until Postgres has the same **tables** and **rows** as local. Run this **on your computer** using the **hosted** URL (same string as Vercel’s `DATABASE_URL`).

**Pick one way to pass the URL:**

- **PowerShell (recommended — does not edit `web/.env`):**

  ```powershell
  $env:DATABASE_URL = "PASTE_YOUR_SUPABASE_POOLER_URL_HERE"
  ```

- **Or** temporarily set `DATABASE_URL=` in **`web/.env`** to the hosted URL, then change it back to local after you’re done.

Then run **in order**:

1. **Migrations** (creates tables on Supabase):

   ```powershell
   cd web
   npx drizzle-kit migrate
   ```

2. **Import SQLite → Postgres** (loads `shop.db`):

   ```powershell
   cd ..
   pip install -r scripts/requirements-etl.txt
   python scripts/import_sqlite_to_pg.py
   ```

**Easiest path:** put the hosted URL in **`web/.env`** as `DATABASE_URL=...` (temporarily replacing the local URL), run **`npx drizzle-kit migrate`** and **`python scripts/import_sqlite_to_pg.py`**, then put the local URL back. The import script loads **`web/.env`** automatically (same as Drizzle). Alternatively, set **`$env:DATABASE_URL`** once in PowerShell and run both commands in that window.

3. Open **`https://YOUR-PROJECT.vercel.app/select-customer`** — you should see customers.

### C. If the build fails on Vercel

- **Root Directory** must be **`web`** so `package.json` is found.
- **Install command** (if asked): `bun i` or `npm install`.
- **Build command:** `bun run build` or `npm run build`.

See **`FIXES.md`** for other known limits (e.g. scoring on Vercel).
