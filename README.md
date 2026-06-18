# RAW Manager

A SaaS platform designed for professional photographers to manage their entire workflow — from client onboarding and shoot sessions to quotes, invoices, and stunning client galleries.

---

## Features

- **Client Management** — Maintain a full CRM for photographer-client relationships
- **Session Tracking** — Schedule and manage photography sessions with location, date, and status
- **Quotes & Invoices** — Generate professional quotes and convert them to invoices with one click
- **Gallery Delivery** — Share private client galleries via secure UUID-based access links (no login required for clients)
- **Dashboard** — At-a-glance overview of revenue, upcoming sessions, pending invoices, and recent activity
- **Role-Based Access** — Two roles: `photographer` (full access) and `client` (read-only gallery access)
- **Image Upload** — Support for JPEG, PNG, and TIFF with up to 50MB per file

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Laravel 11, PHP 8.2, Sanctum            |
| Frontend   | React 18, Vite, Tailwind CSS v4         |
| State      | Zustand, React Query (TanStack)         |
| Database   | MySQL 8.0                               |
| Server     | Nginx (Alpine)                          |
| DevOps     | Docker, Docker Compose, GitHub Actions  |

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 4.x+
- [Node.js](https://nodejs.org/) 20+ (for local frontend dev outside Docker)
- [Composer](https://getcomposer.org/) 2.x (for local backend dev outside Docker)
- [PHP](https://www.php.net/) 8.2+ (for local backend dev outside Docker)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/raw-manager.git
cd raw-manager

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all Docker services
docker compose up -d --build

# 4. Generate Laravel application key
docker compose exec app php artisan key:generate

# 5. Run migrations and seed the database
docker compose exec app php artisan migrate --seed
```

Then open:
- **API / Backend:** http://localhost
- **Frontend (Dev):** http://localhost:5173

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                         │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │   Frontend   │     │    Nginx     │                  │
│  │  React/Vite  │────▶│   :80        │                  │
│  │   :5173      │     │              │                  │
│  └──────────────┘     └──────┬───────┘                  │
│                              │                          │
│                       ┌──────▼───────┐                  │
│                       │   PHP-FPM    │                  │
│                       │  Laravel 11  │                  │
│                       │   :9000      │                  │
│                       └──────┬───────┘                  │
│                              │                          │
│                       ┌──────▼───────┐                  │
│                       │   MySQL 8    │                  │
│                       │   :3306      │                  │
│                       └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
raw-manager/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── backend/                    # Laravel 11 application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   ├── Requests/       # Form Request validation
│   │   │   ├── Resources/      # API Resources (transformers)
│   │   │   └── Middleware/
│   │   ├── Models/             # Eloquent models
│   │   ├── Policies/           # Authorization policies
│   │   └── Services/           # Business logic layer
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env.example
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── api/                # Axios API client + query hooks
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Zustand global state
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Helpers and formatters
│   ├── .env.example
│   └── vite.config.js
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   └── php/
│       ├── Dockerfile
│       └── php.ini
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/register             | Register photographer |
| POST   | /api/login                | Login                |
| POST   | /api/logout               | Logout               |
| GET    | /api/user                 | Get current user     |

### Clients
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/clients              | List all clients     |
| POST   | /api/clients              | Create client        |
| GET    | /api/clients/{id}         | Get client detail    |
| PUT    | /api/clients/{id}         | Update client        |
| DELETE | /api/clients/{id}         | Delete client        |

### Sessions
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/sessions             | List sessions        |
| POST   | /api/sessions             | Create session       |
| GET    | /api/sessions/{id}        | Get session detail   |
| PUT    | /api/sessions/{id}        | Update session       |
| DELETE | /api/sessions/{id}        | Delete session       |

### Quotes
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/quotes               | List quotes          |
| POST   | /api/quotes               | Create quote         |
| GET    | /api/quotes/{id}          | Get quote            |
| PUT    | /api/quotes/{id}          | Update quote         |
| POST   | /api/quotes/{id}/convert  | Convert to invoice   |

### Invoices
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/invoices             | List invoices        |
| GET    | /api/invoices/{id}        | Get invoice          |
| PATCH  | /api/invoices/{id}/pay    | Mark as paid         |

### Galleries
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/galleries                 | List galleries           |
| POST   | /api/galleries                 | Create gallery           |
| GET    | /api/galleries/{id}            | Get gallery              |
| DELETE | /api/galleries/{id}            | Delete gallery           |
| POST   | /api/galleries/{id}/images     | Upload images            |
| GET    | /g/{access_token}              | **Public** gallery view  |

---

## Screenshots

> Coming soon — screenshots will be added as the UI is developed.

| Dashboard | Clients | Gallery |
|-----------|---------|---------|
| _WIP_     | _WIP_   | _WIP_   |

---

## Development Notes

- The `photographer_id` field scopes **all** resources — there is no multi-tenancy/organization layer.
- Gallery public access uses a **UUID `access_token`** stored on the gallery model. No JWT required.
- Backend follows the pattern: **Controllers → Services → Models** with Form Requests for validation and API Resources for transformation.
- Authentication uses Laravel Sanctum with SPA cookie-based auth (not token-based).

---

## License

MIT License. See [LICENSE](LICENSE) for details.
