# RAW Manager

**Plataforma de gestión integral para fotógrafos profesionales.**

Gestiona clientes, sesiones fotográficas, presupuestos, facturas y galerías privadas desde un único panel. Diseñado para trabajar en solitario, sin complejidad de multi-tenant.

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Puesta en marcha](#puesta-en-marcha)
- [Credenciales demo](#credenciales-demo)
- [Manual de usuario](#manual-de-usuario)
- [Referencia de la API](#referencia-de-la-api)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
- [Variables de entorno](#variables-de-entorno)
- [CI/CD](#cicd)
- [Licencia](#licencia)

---

## Características

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | Ingresos totales, por cobrar, sesiones activas, próximas citas, facturas recientes |
| **Clientes** | CRUD completo, historial de sesiones por cliente |
| **Sesiones** | Tipos (boda, retrato, evento…), estados, precio, localización, notas internas |
| **Presupuestos** | Líneas de concepto, cálculo automático de IVA, cambio de estado, exportación PDF |
| **Facturas** | Generadas desde presupuestos aprobados, numeración automática (FAC-YYYY-NNNN), marca de pagada, PDF |
| **Galerías** | Subida de fotos, enlace privado por token UUID, favoritos del cliente |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 6 + Tailwind CSS 4 |
| Estado del cliente | Zustand (auth) + TanStack Query (server state) |
| Backend | Laravel 11 + Sanctum |
| Base de datos | MySQL 8 |
| Servidor | Nginx + PHP-FPM 8.4 |
| Infraestructura | Docker + Docker Compose |
| CI | GitHub Actions |
| PDF | barryvdh/laravel-dompdf |

---

## Puesta en marcha

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 4.x
- Git

No necesitas PHP ni Node instalados localmente — todo corre en contenedores.

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/raw-manager.git
cd raw-manager

# 2. Copia el fichero de entorno
cp backend/.env.example backend/.env

# 3. Levanta los contenedores (primera vez tarda ~2 min en compilar)
docker compose up -d --build

# 4. Genera la clave de aplicación
docker exec raw_app php artisan key:generate

# 5. Ejecuta las migraciones y carga datos de demo
docker exec raw_app php artisan migrate --seed

# 6. Crea el enlace simbólico de storage
docker exec raw_app php artisan storage:link
```

### Acceso

| Servicio | URL |
|---|---|
| Frontend (app) | http://localhost:5173 |
| API | http://localhost/api |
| Base de datos | localhost:3307 (usuario: `raw_manager`, contraseña: `secret`) |

---

## Credenciales demo

El seeder crea datos de ejemplo listos para explorar.

| Rol | Email | Contraseña |
|---|---|---|
| Fotógrafo | `photographer@demo.com` | `password` |
| Cliente | `client@demo.com` | `password` |

El fotógrafo demo tiene 5 clientes, 5 sesiones, 2 presupuestos, 2 facturas y 1 galería preconfiguradas.

---

## Manual de usuario

### Primeros pasos

1. Abre **http://localhost:5173** en tu navegador.
2. Entra con tus credenciales o usa las de demo.
3. El panel de inicio muestra un resumen de tu actividad.

---

### Dashboard

El dashboard es la primera pantalla tras el login. Muestra cuatro métricas clave:

- **Ingresos totales** — suma de todas las facturas en estado *pagada*.
- **Por cobrar** — suma de facturas *pendientes*.
- **Sesiones pendientes** — sesiones que aún no están completadas o canceladas.
- **Clientes activos** — clientes con alguna sesión asociada.

Debajo verás dos paneles:
- **Próximas sesiones** — las siguientes citas ordenadas por fecha.
- **Facturas recientes** — las últimas facturas emitidas con su estado.

---

### Clientes

**Listar clientes**
Accede a *Clientes* en el menú lateral. Verás una tabla con nombre, email, ciudad y número de sesiones. Usa el buscador para filtrar por nombre o email.

**Crear un cliente**
Pulsa *+ Nuevo cliente* y rellena el formulario:
- Nombre y email son obligatorios.
- Teléfono, dirección, ciudad, código postal y NIF son opcionales pero recomendados para las facturas.
- El campo *Notas* es privado (solo lo ves tú).

**Editar o eliminar**
Usa los botones de acción en cada fila. Eliminar un cliente eliminará también sus sesiones asociadas.

**Historial de sesiones**
Haz clic en el nombre del cliente para ver su ficha detallada con todas las sesiones, presupuestos y facturas relacionadas.

---

### Sesiones fotográficas

**Crear una sesión**
Ve a *Sesiones* → *+ Nueva sesión*. Campos:
- **Cliente** — obligatorio. Selecciona de tu lista de clientes.
- **Nombre** — descripción breve (ej. "Boda María y Juan").
- **Fecha y hora** — cuándo se realiza.
- **Tipo** — Boda, Retrato, Evento, Producto, Inmobiliaria, Otro.
- **Localización** — lugar de la sesión.
- **Precio** — importe acordado con el cliente.
- **Notas internas** — visibles solo para ti.

**Estados de una sesión**

| Estado | Significado |
|---|---|
| `Pendiente` | Sesión confirmada pero no realizada |
| `En progreso` | Sesión en curso |
| `Editando` | Post-producción activa |
| `Entregada` | Fotos entregadas al cliente |
| `Completada` | Proceso cerrado |
| `Cancelada` | Sesión cancelada |

Cambia el estado desde la ficha de detalle con los botones de avance rápido.

**Ficha de sesión**
Accede al detalle para ver toda la información, incluyendo el presupuesto y la factura asociados.

---

### Presupuestos

**Crear un presupuesto**
Ve a *Presupuestos* → *+ Nuevo presupuesto*. El formulario tiene dos partes:

1. **Cabecera**: sesión asociada, tipo de IVA (%), fecha de validez y notas.
2. **Líneas de concepto**: añade tantos conceptos como necesites. Cada línea tiene descripción, cantidad y precio unitario. El subtotal se calcula automáticamente.

El total final (base + IVA) se actualiza en tiempo real mientras editas.

**Estados del presupuesto**

| Estado | Significado |
|---|---|
| `Borrador` | En preparación, no enviado |
| `Enviado` | Enviado al cliente para revisión |
| `Aprobado` | Cliente ha aceptado — permite generar factura |
| `Rechazado` | Cliente ha rechazado la propuesta |

Cambia el estado desde la barra lateral de la ficha de detalle.

**Exportar PDF**
Pulsa *Exportar PDF* en la ficha del presupuesto. Se descarga un documento profesional con los datos de tu estudio, los del cliente y el desglose de conceptos.

---

### Facturas

**Crear una factura**
Las facturas se generan siempre desde un presupuesto *aprobado*. Ve a *Facturas* → *+ Nueva factura*, selecciona el presupuesto y establece una fecha de vencimiento opcional.

La numeración es automática con el formato `FAC-YYYY-NNNN` (ej. `FAC-2026-0001`).

**Estados de la factura**

| Estado | Significado |
|---|---|
| `Pendiente` | Emitida, a la espera de pago |
| `Pagada` | Pago recibido — registra la fecha de cobro |
| `Vencida` | Superada la fecha de vencimiento sin pago |

Para marcar una factura como pagada, pulsa *Marcar pagada* en la fila de la tabla.

**Exportar PDF**
Pulsa *PDF* en la fila correspondiente. Las facturas pagadas incluyen un sello visual **PAGADA**.

---

### Galerías privadas

Las galerías permiten compartir las fotos entregadas con el cliente mediante un enlace privado único. No requieren que el cliente tenga cuenta.

**Crear una galería**
Ve a *Galerías* → *+ Nueva galería*. Selecciona la sesión asociada, dale un nombre y una descripción opcional para el cliente.

**Subir fotos**
Accede al detalle de la galería y pulsa *Subir imágenes*. Soporta JPG, PNG y WebP. Puedes seleccionar múltiples archivos a la vez.

**Enlace privado del cliente**
En la ficha de galería verás la URL privada. Pulsa *Copiar enlace cliente* y envíaselo por email, WhatsApp o como prefieras.

**Qué ve el cliente**
El cliente accede a la galería sin necesidad de contraseña. Puede introducir su email para marcar fotos como favoritas (útil para selección de fotos). Las favoritas quedan guardadas asociadas a su email.

**Eliminar imágenes**
En el grid de imágenes, pasa el ratón sobre una foto y pulsa *Eliminar* para borrarla de la galería y del servidor.

---

### Perfil de fotógrafo

Accede a tu perfil para configurar:
- Nombre, email y teléfono.
- **Datos del estudio**: nombre comercial, NIF/CIF, dirección completa — estos datos aparecen en todos los PDFs.
- Bio, web e Instagram.

---

## Referencia de la API

Base URL: `http://localhost/api`

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer {token}
```

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Registrar fotógrafo |
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/auth/logout` | Cerrar sesión |
| `GET` | `/auth/me` | Datos del usuario autenticado |
| `PUT` | `/auth/profile` | Actualizar perfil |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/clients` | Listar (query: `search`, `per_page`) |
| `POST` | `/clients` | Crear |
| `GET` | `/clients/{id}` | Ver detalle |
| `PUT` | `/clients/{id}` | Actualizar |
| `DELETE` | `/clients/{id}` | Eliminar |
| `GET` | `/clients/{id}/sessions` | Sesiones del cliente |

### Sesiones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sessions` | Listar (query: `search`, `status`, `type`, `client_id`) |
| `POST` | `/sessions` | Crear |
| `GET` | `/sessions/{id}` | Ver detalle |
| `PUT` | `/sessions/{id}` | Actualizar |
| `DELETE` | `/sessions/{id}` | Eliminar |
| `PATCH` | `/sessions/{id}/status` | Cambiar estado |

### Presupuestos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/quotes` | Listar (query: `status`) |
| `POST` | `/quotes` | Crear con líneas de concepto |
| `GET` | `/quotes/{id}` | Ver detalle |
| `PUT` | `/quotes/{id}` | Actualizar |
| `DELETE` | `/quotes/{id}` | Eliminar |
| `PATCH` | `/quotes/{id}/status` | Cambiar estado |
| `GET` | `/quotes/{id}/pdf` | Descargar PDF |

### Facturas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/invoices` | Listar (query: `status`) |
| `POST` | `/invoices` | Crear desde presupuesto aprobado |
| `GET` | `/invoices/{id}` | Ver detalle |
| `PATCH` | `/invoices/{id}/status` | Cambiar estado |
| `GET` | `/invoices/{id}/pdf` | Descargar PDF |

### Galerías

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/galleries` | Listar |
| `POST` | `/galleries` | Crear |
| `GET` | `/galleries/{id}` | Ver detalle con imágenes |
| `PUT` | `/galleries/{id}` | Actualizar |
| `DELETE` | `/galleries/{id}` | Eliminar galería e imágenes |
| `POST` | `/galleries/{id}/images` | Subir imágenes (`multipart/form-data`, campo `images[]`) |
| `DELETE` | `/galleries/{id}/images/{imgId}` | Eliminar imagen |

### Galería pública (sin autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/public/gallery/{token}` | Ver galería por token UUID |
| `POST` | `/public/gallery/{token}/favorite/{imageId}` | Marcar/desmarcar favorita (body: `client_email`) |

### Dashboard

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/dashboard/stats` | Estadísticas generales |
| `GET` | `/dashboard/upcoming-sessions` | Próximas sesiones |
| `GET` | `/dashboard/recent-invoices` | Facturas recientes |

---

## Arquitectura del proyecto

```
raw-manager/
├── backend/                    # Laravel 11
│   ├── app/
│   │   ├── Enums/              # SessionType, SessionStatus, QuoteStatus, InvoiceStatus, UserRole
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/       # Validación por dominio
│   │   │   └── Resources/      # Transformadores de respuesta JSON
│   │   ├── Models/             # Eloquent models
│   │   └── Services/           # QuoteService, InvoiceService, GalleryService
│   ├── database/
│   │   ├── migrations/         # 14 migraciones ordenadas
│   │   └── seeders/            # Datos de demo
│   ├── resources/views/pdf/    # Plantillas Blade para PDFs
│   └── routes/api.php
│
├── frontend/                   # React 18 + Vite
│   └── src/
│       ├── api/                # Clientes HTTP por dominio
│       ├── components/
│       │   ├── shared/         # Layout, Sidebar, PageHeader
│       │   └── ui/             # Button, Input, Modal, Badge…
│       ├── features/           # Módulos por dominio
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── clients/
│       │   ├── sessions/
│       │   ├── quotes/
│       │   ├── invoices/
│       │   └── galleries/
│       ├── router/             # React Router v6 + rutas protegidas
│       ├── store/              # Zustand (auth)
│       └── utils/              # Formatters, labels, colores de estado
│
├── docker/
│   ├── nginx/nginx.conf
│   └── php/Dockerfile + php.ini
│
├── .github/workflows/ci.yml   # Tests backend + build frontend
└── docker-compose.yml
```

### Modelo de datos

```
users ─────────────────────────────────── photographer_profiles
  │
  ├── clients
  │     └── photo_sessions ──────────────── quotes
  │                                            └── quote_items
  │                         └────────────── invoices
  │                         └────────────── galleries
  │                                            ├── gallery_images
  │                                            │     └── gallery_image_favorites ── clients
  │                                            └── (access_token UUID público)
```

### Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Sin multi-tenant | Un fotógrafo por instancia; `photographer_id` en cada tabla simplifica consultas |
| Sin Repository Pattern | Capa de abstracción innecesaria para un proyecto de este tamaño |
| UUID en galería pública | Más seguro que IDs secuenciales; sin JWT que gestionar en el cliente |
| Sanctum (token) | Más sencillo que JWT para SPAs internas; revocación inmediata |
| PHP Enums | Tipo seguro para estados; el IDE y la base de datos están siempre alineados |

---

## Desarrollo local sin Docker

Si prefieres trabajar sin Docker:

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Edita .env con tu MySQL local
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve          # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
# Edita vite.config.js: cambia target de proxy a http://localhost:8000
npm run dev                # http://localhost:5173
```

---

## Variables de entorno

Las principales variables de `backend/.env`:

```env
APP_NAME="RAW Manager"
APP_ENV=local
APP_KEY=                        # Generada con artisan key:generate
APP_URL=http://localhost

DB_HOST=db                      # Nombre del servicio Docker (o 127.0.0.1 local)
DB_DATABASE=raw_manager
DB_USERNAME=raw_manager
DB_PASSWORD=secret

SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173

FILESYSTEM_DISK=public          # Las imágenes se sirven por Nginx
```

---

## CI/CD

GitHub Actions ejecuta dos jobs en cada push:

**Backend** (`.github/workflows/ci.yml`):
- PHP 8.2 + extensiones
- MySQL 8 como servicio
- `composer install`
- `php artisan migrate`
- `php artisan test`

**Frontend**:
- Node 20
- `npm ci`
- `npm run build`

---

## Licencia

MIT © 2026
