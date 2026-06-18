# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend**: Laravel 11 + Sanctum (token auth) + DomPDF · PHP 8.4-FPM · MySQL 8
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + React Query + Zustand
- **Infrastructure**: Docker Compose (4 services: `raw_app`, `raw_nginx`, `raw_db`, `raw_frontend`)

## Common commands

All backend commands run inside the container:

```bash
# Start everything
docker compose up -d

# Rebuild only the PHP container (after changes to Dockerfile or php.ini)
docker compose up -d --build app

# Laravel artisan
docker exec raw_app php artisan migrate
docker exec raw_app php artisan migrate:fresh --seed
docker exec raw_app php artisan storage:link
docker exec raw_app php artisan config:cache   # required after .env changes
docker exec raw_app php artisan route:cache
docker exec raw_app php artisan tinker

# Optimize composer autoloader (run after adding/removing classes)
docker exec raw_app composer dump-autoload --optimize

# MySQL CLI
docker exec -it raw_db mysql -u raw_manager -psecret raw_manager
```

Frontend runs automatically inside `raw_frontend` on `http://localhost:5173`.
There are no frontend build steps needed in development — Vite HMR is active.

## Architecture

### Request flow

```
Browser (localhost:5173)
  → Vite dev server
    → /api/*   proxy → nginx (port 80) → PHP-FPM (raw_app:9000)
    → /storage/* proxy → nginx → static files (app-storage Docker volume)
```

The proxy target inside the container network is `http://nginx` (service name), **not** `http://localhost`.

### Authorization model

Every protected resource is scoped to `photographer_id`. Controllers manually check ownership with `abort_if($resource->photographer_id !== $request->user()->id, 403)`. There is no Laravel Policy layer — all auth is inline in controllers.

### Data model hierarchy

```
User (photographer)
  └── Client
        └── PhotoSession
              ├── Quote → QuoteItem[]
              ├── Invoice (created from Quote via InvoiceService)
              └── Gallery → GalleryImage[]
```

Each `PhotoSession` has at most one `Quote`, one `Invoice`, and one `Gallery`.

### PDF generation (DomPDF)

PDFs are generated in `QuoteService::generatePdf()` and `InvoiceService::generatePdf()` using Blade templates at `resources/views/pdf/`. **Critical constraints**:
- Font must be `Helvetica, Arial, sans-serif` (PDF base-14). Any other font causes glyph rendering bugs with the CPDF backend.
- DomPDF supports CSS 2.1 only — no `display:flex`, no grid. Use HTML tables for layout.
- Config is at `config/dompdf.php`. Image URLs in templates must use `file://` paths, not HTTP.

### Gallery image URLs

`GalleryImageResource` returns `/storage/{path}` (relative URLs), not absolute ones. This is intentional — the Vite proxy forwards `/storage/*` to nginx, so absolute `http://localhost/storage/...` URLs break when accessed from port 5173.

### Frontend state

- **Auth**: Zustand store (`src/store/authStore.js`) persisted to `localStorage` as `auth-store`. The token is also stored separately under the `token` key.
- **Server state**: React Query with `staleTime: 60s`, `gcTime: 5min`, `refetchOnWindowFocus: false`. 4xx errors do not trigger retries.
- **API client**: `src/api/client.js` — axios instance with Bearer token interceptor. On 401, clears both `token` and `auth-store` from localStorage and redirects to `/login` (only if not already there).

### PHP-FPM tuning

`docker/php/www.conf` sets `pm = static` with 16 workers (always-warm, no spawn overhead). OPcache JIT (`tracing` mode, 100 MB buffer) is configured in `docker/php/php.ini`.

## Demo credentials

```
Email:    photographer@demo.com
Password: password
```

The seeder creates 1 photographer, 5 clients, 5 sessions, 2 quotes, 2 invoices, 1 gallery with 8 images.

## Known constraints

- **MySQL port**: mapped to `3307` on the host (not 3306, to avoid conflicts). GUI clients must connect to `127.0.0.1:3307`.
- **Storage volume**: `app-storage` is a named Docker volume shared between `raw_app` and `raw_nginx`. `php artisan storage:link` only needs to run once after first `migrate`.
- **Config cache**: After any `.env` change, run `php artisan config:cache` inside the container or the change won't take effect.
- **Migration order**: Migrations with the same timestamp sort alphabetically. FK dependencies must have strictly later timestamps (learned the hard way with `quote_items` → `quotes`).
