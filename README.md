# RAW Manager

SaaS platform for professional photographers to manage clients, sessions, quotes, invoices, and private galleries.

## Features

- **Authentication** — Register/login with role-based access (photographer & client)
- **Clients** — Full CRUD with session history
- **Photo Sessions** — Track sessions by type, status, price, location, and notes
- **Quotes** — Create quotes with line items, auto-calculated totals, and PDF export
- **Invoices** — Generate invoices from approved quotes with auto-numbering and PDF export
- **Private Galleries** — Upload photos, share via private token link, clients can mark favorites
- **Dashboard** — Revenue stats, upcoming sessions, pending invoices, active clients

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 18 + Vite + Tailwind CSS |
| State    | Zustand + React Query          |
| Backend  | Laravel 11 + Sanctum           |
| Database | MySQL 8                        |
| Server   | Nginx + PHP-FPM                |
| Infra    | Docker + Docker Compose        |
| CI       | GitHub Actions                 |

## Architecture

`React (5173) --> Nginx (80) --> PHP-FPM (9000) --> MySQL (3306)
                                     |
                                  Storage
                               (images/PDFs)`

## Quick Start

### Requirements

- Docker Desktop >= 4.x
- Node.js >= 20
- Composer >= 2.x
- PHP >= 8.2

### Setup

`ash

# 1. Clone

git clone https://github.com/your-user/raw-manager.git
cd raw-manager

# 2. Environment

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start containers

docker compose up -d --build

# 4. Backend setup

docker exec raw_app php artisan key:generate
docker exec raw_app php artisan migrate --seed

# 5. Create storage link

docker exec raw_app php artisan storage:link
`

Visit **http://localhost** for the API and **http://localhost:5173** for the frontend.

### Demo credentials

| Role         | Email                 | Password |
| ------------ | --------------------- | -------- |
| Photographer | photographer@demo.com | password |
| Client       | client@demo.com       | password |

## API Endpoints

### Auth

| Method | Endpoint           | Description  |
| ------ | ------------------ | ------------ |
| POST   | /api/auth/register | Register     |
| POST   | /api/auth/login    | Login        |
| POST   | /api/auth/logout   | Logout       |
| GET    | /api/auth/me       | Current user |

### Clients

| Method | Endpoint          | Description   |
| ------ | ----------------- | ------------- |
| GET    | /api/clients      | List clients  |
| POST   | /api/clients      | Create client |
| GET    | /api/clients/{id} | Get client    |
| PUT    | /api/clients/{id} | Update client |
| DELETE | /api/clients/{id} | Delete client |

### Sessions, Quotes, Invoices, Galleries

Full REST API — see /api/documentation (coming soon).

## Project Structure

`raw-manager/
├── backend/          # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Policies/
│   └── database/
│       ├── migrations/
│       └── seeders/
├── frontend/         # React + Vite
│   └── src/
│       ├── features/ # Domain modules
│       ├── components/
│       ├── api/
│       └── store/
├── docker/
│   ├── nginx/
│   └── php/
└── .github/workflows/`

## Screenshots

_Coming soon_

## License

MIT
