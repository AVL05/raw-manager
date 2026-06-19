# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Stack

- **Backend**: Laravel 13 + Sanctum token auth + DomPDF + PHP 8.3+
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4 + React Query + Zustand
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

## Architecture

### Request flow

```text
Browser (localhost:5173)
  -> Vite development server
    -> /api/* proxy -> Laravel (127.0.0.1:8000)
    -> /storage/* proxy -> Laravel public storage
```

### Authorization model

Every protected resource is scoped to `photographer_id`. Controllers manually
check ownership with
`abort_if($resource->photographer_id !== $request->user()->id, 403)`. There is
no Laravel Policy layer; authorization remains inline in controllers.

### Data model hierarchy

```text
User (photographer)
  -> Client
       -> PhotoSession
            -> Quote -> QuoteItem[]
            -> Invoice
            -> Gallery -> GalleryImage[]
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

- Auth uses Zustand and persists as `auth-store`; the token is also stored under
  `token`.
- React Query uses `staleTime: 60s`, `gcTime: 5min`, and
  `refetchOnWindowFocus: false`.
- The Axios client is in `src/api/client.js`. A 401 clears `token` and
  `auth-store`, then redirects to `/login`.

## Demo credentials

```text
Email: photographer@demo.com
Password: password
```

## Known constraints

- XAMPP MySQL/MariaDB must be running on `127.0.0.1:3306`.
- The default local database is `raw_manager`, with user `root` and no password.
- Run `php artisan config:clear` after changing `.env`.
- Migration filenames with the same timestamp sort alphabetically, so foreign
  key dependencies need a strictly later timestamp.
