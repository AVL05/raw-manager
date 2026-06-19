# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Stack

- **Backend**: Laravel 13 + Sanctum token auth + DomPDF + PHP 8.3+
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4 + React Query + Zustand + Framer Motion
- **PWA**: vite-plugin-pwa + Workbox (Service Worker generado automáticamente)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: MySQL/MariaDB provided locally by XAMPP
- **Local servers**: Laravel development server on port 8000 and Vite on port 5173

## Local commands

Start MySQL from the XAMPP Control Panel before running backend commands.

```powershell
# Backend
Set-Location backend
composer install
php artisan migrate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan config:clear
php artisan route:list
php artisan serve --host=127.0.0.1 --port=8000

# Frontend, in another terminal
Set-Location frontend
npm install
npm run dev
```

To access the XAMPP database from PowerShell:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root raw_manager
```

To regenerate PWA icons after changing `public/favicon.svg`:

```powershell
Set-Location frontend
npx pwa-assets-generator --preset minimal public/favicon.svg
```

## Architecture

### Request flow

```text
Browser / PWA (localhost:5173)
  -> Vite development server
    -> /api/* proxy -> Laravel (127.0.0.1:8000)
    -> /storage/* proxy -> Laravel public storage
```

### Authorization model

Single-user architecture. Every resource is scoped to `photographer_id`. Controllers check
ownership inline with `abort_if($resource->photographer_id !== $request->user()->id, 403)`.
There is no Laravel Policy layer. There is only one role: `photographer`.

### Data model hierarchy

```text
User (photographer)
  -> PhotographerProfile
  -> Client
       -> PhotoSession
            -> Quote -> QuoteItem[]
            -> Invoice
            -> Gallery -> GalleryImage[]
  -> Equipment
  -> Preset
  -> Location -> LocationPhoto[]
  -> Moodboard -> MoodboardItem[]
  -> PhotoLibrary
```

Each `PhotoSession` has at most one `Quote`, one `Invoice`, and one `Gallery`.

### PDF generation

PDFs are generated in `QuoteService::generatePdf()` and
`InvoiceService::generatePdf()` using the Blade templates under
`resources/views/pdf/`.

- Use `Helvetica, Arial, sans-serif`.
- DomPDF supports CSS 2.1; use HTML tables instead of flex or grid.
- Image URLs in PDF templates must use local `file://` paths.

### Gallery image URLs

`GalleryImageResource` returns `/storage/{path}` relative URLs. Vite proxies
`/storage/*` to the Laravel development server, which serves the
`public/storage` symbolic link created by `php artisan storage:link`.

### Frontend state

- Auth uses Zustand and persists as `auth-store`; the token is also stored under `token`.
- UI state (sidebar collapsed) uses Zustand and persists as `ui-store`.
- React Query uses `staleTime: 60s`, `gcTime: 5min`, and `refetchOnWindowFocus: false`.
- The Axios client is in `src/api/client.js`. A 401 clears `token` and `auth-store`, then redirects to `/login`.

### Design system

CSS custom properties defined in `src/index.css` under `:root`. All color references use
`var(--token-name)`. Never add unlayered CSS rules (outside `@layer`) — they override all
Tailwind utilities due to CSS Cascade Layers specificity. Only `:root`, pseudo-element
selectors (`::selection`, `::-webkit-scrollbar`) and `@layer` blocks are safe in `index.css`.

Key tokens: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`, `--border-subtle`,
`--border-default`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-muted`,
`--accent`, `--accent-hover`, `--accent-subtle`, `--accent-border`, `--accent-glow`.

### PWA

`vite-plugin-pwa` with `generateSW` strategy. On `npm run build` it produces `dist/sw.js`
and `dist/workbox-*.js`. The Service Worker pre-caches all static assets and uses `CacheFirst`
for `/storage/*` images (7 days TTL, 200 entries max). API calls (`/api/*`) bypass the cache.

`InstallBanner` component listens for `beforeinstallprompt` and shows a bottom toast. Once
dismissed it stores `pwa-install-dismissed=1` in localStorage and never shows again.

## Demo credentials

```text
Email: photographer@demo.com
Password: password
```

The seeder creates: 1 photographer (Alejandro Vidal), 10 clients, 10 sessions across past/future
dates, 7 quotes, 5 invoices (paid/pending/overdue), 3 galleries, 14 equipment items (Sony/Godox/
Profoto/DJI gear), 8 presets, 8 Spanish locations and 6 moodboards — all with realistic data.

## Known constraints

- XAMPP MySQL/MariaDB must be running on `127.0.0.1:3306`.
- The default local database is `raw_manager`, with user `root` and no password.
- Run `php artisan config:clear` after changing `.env`.
- Migration filenames with the same timestamp sort alphabetically, so foreign key dependencies
  need a strictly later timestamp.
- There is no client role, no client portal and no public gallery route. Single-user only.
