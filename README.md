# RAW Manager — Photography OS

**Plataforma de gestión integral para fotógrafos profesionales.**

Dashboard, clientes, sesiones, presupuestos, facturas, galerías, equipamiento, presets, localizaciones, moodboards y biblioteca fotográfica — todo desde un único panel de control oscuro, instalable como app en cualquier dispositivo.

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Puesta en marcha](#puesta-en-marcha)
- [Credenciales demo](#credenciales-demo)
- [Instalación como PWA](#instalación-como-pwa)
- [Módulos](#módulos)
- [Referencia de la API](#referencia-de-la-api)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)

---

## Características

| Módulo | Descripción |
|---|---|
| **Dashboard** | Ingresos totales, por cobrar, sesiones activas, gráfico de evolución mensual, próximas citas y facturas recientes |
| **Clientes** | CRUD completo con historial de sesiones por cliente |
| **Sesiones** | Tipos (boda, retrato, evento, producto…), estados, precio, localización, notas internas |
| **Presupuestos** | Líneas de concepto, cálculo de IVA en tiempo real, cambio de estado, exportación PDF |
| **Facturas** | Numeración automática `FAC-YYYY-NNNN`, estados pagada/pendiente/vencida, PDF con sello |
| **Galerías** | Subida de fotos, galería privada por sesión |
| **Equipamiento** | Inventario de cámaras, objetivos, iluminación y accesorios agrupados por tipo |
| **Presets** | Configuraciones de cámara por categoría (bodas, retrato, producto…) con parámetros técnicos |
| **Localizaciones** | Fichas con coordenadas, datos meteorológicos en tiempo real y datos solares (amanecer, atardecer, hora dorada) |
| **Moodboards** | Colecciones de referencias visuales organizadas por carpetas |
| **Biblioteca** | Galería masonry con lightbox y subida drag-and-drop |
| **Command Palette** | `Ctrl+K` para navegar, crear y buscar desde cualquier pantalla |
| **PWA** | Instalable en Windows, Mac, iOS y Android sin tiendas de aplicaciones |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Gráficos | Recharts |
| Estado del cliente | Zustand (auth + UI) + TanStack Query (server state) |
| Backend | Laravel 13 + Sanctum |
| Base de datos | MySQL/MariaDB |
| PDF | barryvdh/laravel-dompdf |
| PWA | vite-plugin-pwa + Workbox |
| Servidor local | XAMPP (MySQL) + `php artisan serve` |

---

## Puesta en marcha

### Requisitos

- XAMPP con MySQL/MariaDB en el puerto 3306
- PHP >= 8.3 y Composer
- Node.js >= 20 y npm

### Instalación

```powershell
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/raw-manager.git
cd raw-manager

# 2. Crea la base de datos en XAMPP
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS raw_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Configura el backend
cd backend
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000

# 4. En otra terminal, inicia el frontend
cd frontend
npm install
npm run dev
```

### Acceso

| Servicio | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://127.0.0.1:8000/api |
| Base de datos | 127.0.0.1:3306 (usuario: `root`, sin contraseña) |

---

## Credenciales demo

El seeder carga datos realistas de un estudio de fotografía madrileño.

| Email | Contraseña |
|---|---|
| `photographer@demo.com` | `password` |

Incluye: **10 clientes**, **10 sesiones** (pasadas y futuras), **7 presupuestos**, **5 facturas** (pagadas, pendientes y vencida), **3 galerías**, **14 equipos** (Sony, Godox, Profoto, DJI…), **8 presets**, **8 localizaciones** españolas y **6 moodboards**.

---

## Instalación como PWA

La app es una Progressive Web App instalable sin tiendas de aplicaciones.

**Chrome / Edge (Windows y Mac):**
Aparece un icono de instalación en la barra de direcciones. La propia app muestra un banner «Instalar» en la parte inferior la primera vez.

**Android:**
Chrome muestra automáticamente el banner de instalación.

**iOS / Safari:**
Botón compartir → «Añadir a pantalla de inicio».

Una vez instalada, la app abre con icono propio, sin barra del navegador.

### Acceso desde móvil en la misma red WiFi

```powershell
# Averigua la IP local del ordenador
ipconfig | findstr "IPv4"

# Accede desde el móvil:  http://192.168.1.XX:5173
```

---

## Módulos

### Dashboard

Métricas en tiempo real: ingresos cobrados, importe pendiente, sesiones activas y clientes. Gráfico de área con la evolución mensual de ingresos. Alerta de facturas vencidas. Lista de próximas sesiones y facturas recientes con estado.

### Clientes

CRUD completo. Campos: nombre, email, teléfono, dirección, ciudad, código postal, NIF y notas privadas. Ficha de cliente con historial de sesiones asociadas.

### Sesiones fotográficas

**Tipos:** Boda, Retrato, Evento, Producto, Inmobiliaria, Otro.

**Estados:**

| Estado | Descripción |
|---|---|
| Pendiente | Confirmada, aún no realizada |
| Confirmada | Detalles acordados con el cliente |
| En progreso | Sesión en curso |
| Finalizada | Realizada, en postproducción |
| Entregada | Material enviado al cliente |
| Cancelada | Sesión cancelada |

### Presupuestos

Líneas de concepto con cantidad y precio unitario. IVA configurable por presupuesto. Flujo de estados: Borrador → Enviado → Aprobado / Rechazado. Exportación a PDF con datos del estudio y del cliente.

### Facturas

Generadas desde presupuestos aprobados. Numeración automática. Estados: Pendiente / Pagada / Vencida. PDF con sello «PAGADA» cuando corresponde.

### Galerías

Subida múltiple de imágenes por sesión. Galería privada accesible desde la ficha de sesión.

### Equipamiento

Inventario agrupado por tipo: cámara, objetivo, iluminación, trípode, bolsa, accesorio. Campos: nombre, marca, modelo, número de serie, fecha y precio de compra, estado de conservación y notas.

### Presets

Configuraciones técnicas de cámara organizadas por categoría. Parámetros: ISO, apertura, velocidad de obturación, balance de blancos y compensación de exposición. Botón de copia al portapapeles en cada parámetro.

### Localizaciones

Fichas con nombre, categoría, coordenadas GPS y descripción. Widget de clima en tiempo real mediante [Open-Meteo](https://open-meteo.com) (sin API key). Datos solares (amanecer, atardecer, duración del día) mediante [Sunrise-Sunset API](https://sunrise-sunset.org/api). Enlace directo a Google Maps.

### Moodboards

Colecciones de referencias visuales agrupadas por carpetas. Útil para briefings con clientes y preparación de sesiones.

### Biblioteca fotográfica

Grid masonry con lightbox (navegación con flechas). Subida drag-and-drop o selector de archivos. Soporte JPG, PNG y WebP.

---

## Referencia de la API

Base URL: `http://127.0.0.1:8000/api`

Todos los endpoints protegidos requieren:
```
Authorization: Bearer {token}
```

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/auth/logout` | Cerrar sesión |
| `GET` | `/auth/me` | Usuario autenticado |
| `PUT` | `/auth/profile` | Actualizar perfil |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/clients` | Listar (query: `search`, `per_page`) |
| `POST` | `/clients` | Crear |
| `GET` | `/clients/{id}` | Detalle |
| `PUT` | `/clients/{id}` | Actualizar |
| `DELETE` | `/clients/{id}` | Eliminar |
| `GET` | `/clients/{id}/sessions` | Sesiones del cliente |

### Sesiones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sessions` | Listar (query: `search`, `status`, `type`, `client_id`) |
| `POST` | `/sessions` | Crear |
| `GET` | `/sessions/{id}` | Detalle |
| `PUT` | `/sessions/{id}` | Actualizar |
| `DELETE` | `/sessions/{id}` | Eliminar |
| `PATCH` | `/sessions/{id}/status` | Cambiar estado |

### Presupuestos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/quotes` | Listar (query: `status`) |
| `POST` | `/quotes` | Crear con líneas de concepto |
| `GET` | `/quotes/{id}` | Detalle |
| `PUT` | `/quotes/{id}` | Actualizar |
| `DELETE` | `/quotes/{id}` | Eliminar |
| `PATCH` | `/quotes/{id}/status` | Cambiar estado |
| `GET` | `/quotes/{id}/pdf` | Descargar PDF |

### Facturas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/invoices` | Listar (query: `status`) |
| `POST` | `/invoices` | Crear desde presupuesto aprobado |
| `GET` | `/invoices/{id}` | Detalle |
| `PATCH` | `/invoices/{id}/status` | Cambiar estado |
| `GET` | `/invoices/{id}/pdf` | Descargar PDF |

### Galerías

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/galleries` | Listar |
| `POST` | `/galleries` | Crear |
| `GET` | `/galleries/{id}` | Detalle con imágenes |
| `PUT` | `/galleries/{id}` | Actualizar |
| `DELETE` | `/galleries/{id}` | Eliminar |
| `POST` | `/galleries/{id}/images` | Subir imágenes (`images[]`) |
| `DELETE` | `/galleries/{id}/images/{imgId}` | Eliminar imagen |

### Equipamiento

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/equipment` | Listar |
| `POST` | `/equipment` | Crear |
| `GET` | `/equipment/{id}` | Detalle |
| `PUT` | `/equipment/{id}` | Actualizar |
| `DELETE` | `/equipment/{id}` | Eliminar |

### Presets

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/presets` | Listar |
| `POST` | `/presets` | Crear |
| `GET` | `/presets/{id}` | Detalle |
| `PUT` | `/presets/{id}` | Actualizar |
| `DELETE` | `/presets/{id}` | Eliminar |

### Localizaciones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/locations` | Listar |
| `POST` | `/locations` | Crear |
| `GET` | `/locations/{id}` | Detalle |
| `PUT` | `/locations/{id}` | Actualizar |
| `DELETE` | `/locations/{id}` | Eliminar |
| `POST` | `/locations/{id}/photos` | Subir fotos de localización |
| `DELETE` | `/locations/{id}/photos/{photoId}` | Eliminar foto |

### Moodboards

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/moodboards` | Listar |
| `POST` | `/moodboards` | Crear |
| `GET` | `/moodboards/{id}` | Detalle con items |
| `PUT` | `/moodboards/{id}` | Actualizar |
| `DELETE` | `/moodboards/{id}` | Eliminar |
| `POST` | `/moodboards/{id}/items` | Añadir item |
| `DELETE` | `/moodboards/{id}/items/{itemId}` | Eliminar item |

### Biblioteca fotográfica

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/photo-library` | Listar |
| `POST` | `/photo-library/upload` | Subir fotos (multipart) |
| `DELETE` | `/photo-library/{id}` | Eliminar |

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
├── backend/                        # Laravel 13
│   ├── app/
│   │   ├── Enums/                  # SessionType, SessionStatus, QuoteStatus,
│   │   │                           # InvoiceStatus, UserRole
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # Un controller por dominio
│   │   │   ├── Requests/           # Validación de formularios
│   │   │   └── Resources/          # Transformadores de respuesta JSON
│   │   ├── Models/                 # Eloquent models
│   │   └── Services/               # QuoteService, InvoiceService, GalleryService
│   ├── database/
│   │   ├── migrations/             # 22 migraciones ordenadas por timestamp
│   │   └── seeders/                # DatabaseSeeder con datos realistas
│   ├── resources/views/pdf/        # Plantillas Blade para PDFs
│   └── routes/api.php
│
├── frontend/                       # React 19 + Vite 8
│   ├── public/                     # favicon.svg + iconos PWA generados
│   └── src/
│       ├── api/                    # Clientes HTTP por dominio
│       ├── components/
│       │   ├── shared/             # AppLayout, Sidebar, PageHeader
│       │   └── ui/                 # Button, Input, Modal, Badge,
│       │                           # CommandPalette, InstallBanner…
│       ├── features/               # Páginas por módulo
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── clients/
│       │   ├── sessions/
│       │   ├── quotes/
│       │   ├── invoices/
│       │   ├── galleries/
│       │   ├── equipment/
│       │   ├── presets/
│       │   ├── locations/
│       │   ├── moodboards/
│       │   └── photoLibrary/
│       ├── router/                 # React Router v7 + guards de autenticación
│       ├── store/                  # Zustand: authStore, uiStore
│       └── index.css               # Design tokens (CSS custom properties)
│
└── CLAUDE.md                       # Guía para Claude Code
```

### Modelo de datos

```
users ──────────────────── photographer_profiles
  │
  ├── clients
  │     └── photo_sessions ────── quotes ── quote_items
  │                         ────── invoices
  │                         ────── galleries ── gallery_images
  │
  ├── equipment
  ├── presets
  ├── locations ────── location_photos
  ├── moodboards ───── moodboard_items
  └── photo_library
```

### Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Un único rol (`photographer`) | App personal; sin portal de clientes ni acceso externo |
| Autorización inline en controllers | Sin capa de Policies; suficiente para un solo usuario |
| Sanctum (token) | Más simple que JWT; revocación inmediata |
| PHP Enums para estados | Tipo seguro; el IDE y la BD siempre alineados |
| CSS custom properties | Design system coherente sin romper Tailwind Cascade Layers |
| PWA con `generateSW` | Workbox maneja el Service Worker automáticamente |

---

## Variables de entorno

Variables principales en `backend/.env`:

```env
APP_NAME="RAW Manager"
APP_ENV=local
APP_KEY=                        # php artisan key:generate
APP_URL=http://127.0.0.1:8000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=raw_manager
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173

FILESYSTEM_DISK=local
```

---

## Licencia

MIT © 2026
