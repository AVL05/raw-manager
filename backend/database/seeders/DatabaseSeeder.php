<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Enums\QuoteStatus;
use App\Enums\SessionStatus;
use App\Enums\SessionType;
use App\Models\Client;
use App\Models\Equipment;
use App\Models\Gallery;
use App\Models\Invoice;
use App\Models\Location;
use App\Models\Moodboard;
use App\Models\MoodboardItem;
use App\Models\PhotoSession;
use App\Models\PhotographerProfile;
use App\Models\Preset;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Fotógrafo demo ──────────────────────────────────────────────
        $photographer = User::create([
            'name'     => 'Alejandro Vidal',
            'email'    => 'photographer@demo.com',
            'password' => Hash::make('password'),
            'role'     => 'photographer',
            'phone'    => '+34 612 845 673',
        ]);

        PhotographerProfile::create([
            'user_id'       => $photographer->id,
            'business_name' => 'Vidal Photography Studio',
            'nif'           => '47823156G',
            'address'       => 'Calle Fuencarral 92, 3º Izq',
            'city'          => 'Madrid',
            'postal_code'   => '28004',
            'country'       => 'España',
            'bio'           => 'Fotógrafo profesional con más de 12 años de experiencia especializado en bodas, retratos y fotografía de producto. Premio Nacional de Fotografía 2022.',
            'website'       => 'https://vidalphoto.es',
            'instagram'     => '@vidalphoto',
        ]);

        // ── Clientes ────────────────────────────────────────────────────
        $clientsData = [
            [
                'name'        => 'Sofía Hernández Mora',
                'email'       => 'sofia.hernandez@gmail.com',
                'phone'       => '+34 611 234 567',
                'city'        => 'Madrid',
                'address'     => 'Calle Goya 47, 2º B',
                'postal_code' => '28001',
                'nif'         => '52341678N',
                'notes'       => 'Clienta habitual. Muy puntual. Prefiere sesiones por la mañana.',
            ],
            [
                'name'        => 'Carlos & Laura Benítez',
                'email'       => 'carloslaura.benitez@hotmail.com',
                'phone'       => '+34 622 345 678',
                'city'        => 'Alcalá de Henares',
                'address'     => 'Av. de Madrid 15',
                'postal_code' => '28801',
                'notes'       => 'Pareja. Boda en septiembre. Han reservado también preboda.',
            ],
            [
                'name'        => 'Inversiones Ríos S.L.',
                'email'       => 'marketing@inversionesrios.com',
                'phone'       => '+34 91 432 5678',
                'city'        => 'Madrid',
                'address'     => 'Paseo de la Castellana 200',
                'postal_code' => '28046',
                'nif'         => 'B87654321',
                'notes'       => 'Empresa. Necesitan factura con IVA. Contacto: Marta Ríos.',
            ],
            [
                'name'        => 'Elena Saura Jiménez',
                'email'       => 'elena.saura@me.com',
                'phone'       => '+34 633 456 789',
                'city'        => 'Pozuelo de Alarcón',
                'address'     => 'C/ Rosales 8',
                'postal_code' => '28224',
                'nif'         => '28765432P',
            ],
            [
                'name'        => 'Roberto Castillo',
                'email'       => 'rcastillo.foto@gmail.com',
                'phone'       => '+34 644 567 890',
                'city'        => 'Getafe',
                'address'     => 'C/ Toledo 34, 1º A',
                'postal_code' => '28901',
                'notes'       => 'Sesiones de producto regularmente. Paga siempre al contado.',
            ],
            [
                'name'        => 'Natalia Fuentes García',
                'email'       => 'natalia.fuentes@outlook.com',
                'phone'       => '+34 655 678 901',
                'city'        => 'Majadahonda',
                'postal_code' => '28220',
            ],
            [
                'name'        => 'Restaurante La Taberna del Mar',
                'email'       => 'direccion@tabernadelmar.es',
                'phone'       => '+34 91 567 8901',
                'city'        => 'Madrid',
                'address'     => 'C/ Huertas 12',
                'postal_code' => '28012',
                'nif'         => 'B12398765',
                'notes'       => 'Fotografía gastronómica trimestral para carta y redes sociales.',
            ],
            [
                'name'        => 'Pablo & Marta Serrano',
                'email'       => 'pablo.serrano.foto@gmail.com',
                'phone'       => '+34 666 789 012',
                'city'        => 'Las Rozas',
                'postal_code' => '28230',
                'notes'       => 'Recién casados. Esperan bebé. Sesión de embarazo confirmada.',
            ],
            [
                'name'        => 'Tech Solutions Madrid',
                'email'       => 'eventos@techsolutions.es',
                'phone'       => '+34 91 234 5670',
                'city'        => 'Madrid',
                'address'     => 'Parque Empresarial La Moraleja, Ed. 3',
                'postal_code' => '28109',
                'nif'         => 'A23456789',
            ],
            [
                'name'        => 'Claudia Romero Vega',
                'email'       => 'claudia.romero@icloud.com',
                'phone'       => '+34 677 890 123',
                'city'        => 'Alcobendas',
                'postal_code' => '28100',
                'notes'       => 'Modelo freelance. Sesiones de book profesional.',
            ],
        ];

        $clients = [];
        foreach ($clientsData as $cd) {
            $clients[] = Client::create(array_merge($cd, ['photographer_id' => $photographer->id]));
        }

        // ── Sesiones ────────────────────────────────────────────────────
        // Boda entregada (hace 4 meses)
        $s1 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[1]->id,
            'name'            => 'Boda Benítez - Finca El Encinar',
            'type'            => SessionType::Wedding,
            'status'          => SessionStatus::Delivered,
            'price'           => 3200.00,
            'date'            => now()->subMonths(4)->toDateString(),
            'time'            => '11:00:00',
            'location'        => 'Finca El Encinar, Alcalá de Henares',
            'internal_notes'  => 'Ceremonia civil exterior. Cóctel 3h. Banquete 5h. Coche de novios vintage incluido.',
        ]);

        // Retrato corporativo (hace 6 semanas, cobrada)
        $s2 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[2]->id,
            'name'            => 'Retratos corporativos Inversiones Ríos',
            'type'            => SessionType::Portrait,
            'status'          => SessionStatus::Delivered,
            'price'           => 1850.00,
            'date'            => now()->subWeeks(6)->toDateString(),
            'time'            => '09:30:00',
            'location'        => 'Oficinas Inversiones Ríos, Madrid',
            'internal_notes'  => '12 empleados. Fondo gris neutro. Entregar antes del 15.',
        ]);

        // Producto restaurante (hace 3 semanas, pendiente pago)
        $s3 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[6]->id,
            'name'            => 'Fotografía gastronómica La Taberna del Mar',
            'type'            => SessionType::Product,
            'status'          => SessionStatus::Done,
            'price'           => 750.00,
            'date'            => now()->subWeeks(3)->toDateString(),
            'time'            => '10:00:00',
            'location'        => 'Restaurante La Taberna del Mar, Madrid',
            'internal_notes'  => '30 platos para nueva carta de verano. Estilo food editorial.',
        ]);

        // Evento tech (hace 2 semanas, factura vencida)
        $s4 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[8]->id,
            'name'            => 'Summit Tech Solutions 2026',
            'type'            => SessionType::Event,
            'status'          => SessionStatus::Delivered,
            'price'           => 1200.00,
            'date'            => now()->subWeeks(5)->toDateString(),
            'time'            => '08:00:00',
            'location'        => 'Hotel NH Collection Gran Vía, Madrid',
            'internal_notes'  => 'Conferencia anual. 400 asistentes. Ponentes + networking.',
        ]);

        // Sesión book modelo (hace 1 mes)
        $s5 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[9]->id,
            'name'            => 'Book profesional Claudia Romero',
            'type'            => SessionType::Portrait,
            'status'          => SessionStatus::Delivered,
            'price'           => 550.00,
            'date'            => now()->subMonth()->toDateString(),
            'time'            => '16:00:00',
            'location'        => 'Estudio Vidal, Madrid + Exterior Retiro',
            'internal_notes'  => '4 looks diferentes. Maquillaje incluido. 20 fotos editadas.',
        ]);

        // Sesión retrato familia (confirmada, próxima semana)
        $s6 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[0]->id,
            'name'            => 'Retrato familiar Hernández',
            'type'            => SessionType::Portrait,
            'status'          => SessionStatus::Confirmed,
            'price'           => 480.00,
            'date'            => now()->addDays(6)->toDateString(),
            'time'            => '17:30:00',
            'location'        => 'Jardines del Buen Retiro, Madrid',
        ]);

        // Preboda (confirmada, 2 semanas)
        $s7 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[1]->id,
            'name'            => 'Preboda Benítez - Segovia',
            'type'            => SessionType::Portrait,
            'status'          => SessionStatus::Confirmed,
            'price'           => 650.00,
            'date'            => now()->addWeeks(2)->toDateString(),
            'time'            => '09:00:00',
            'location'        => 'Acueducto de Segovia + Alcázar',
        ]);

        // Embarazo (pendiente, 3 semanas)
        $s8 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[7]->id,
            'name'            => 'Sesión embarazo Pablo & Marta',
            'type'            => SessionType::Portrait,
            'status'          => SessionStatus::Pending,
            'price'           => 390.00,
            'date'            => now()->addWeeks(3)->toDateString(),
            'time'            => '11:00:00',
            'location'        => 'Jardines La Quinta, Las Rozas',
        ]);

        // Producto cosmética (pendiente, mes próximo)
        $s9 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[4]->id,
            'name'            => 'Catálogo cosmética Roberto Castillo',
            'type'            => SessionType::Product,
            'status'          => SessionStatus::Pending,
            'price'           => 920.00,
            'date'            => now()->addDays(28)->toDateString(),
            'time'            => '10:00:00',
            'location'        => 'Estudio Vidal, Madrid',
        ]);

        // Boda próxima (confirmada, 6 semanas)
        $s10 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id'       => $clients[3]->id,
            'name'            => 'Boda Saura - Hacienda Los Pinos',
            'type'            => SessionType::Wedding,
            'status'          => SessionStatus::Confirmed,
            'price'           => 2800.00,
            'date'            => now()->addWeeks(6)->toDateString(),
            'time'            => '12:00:00',
            'location'        => 'Hacienda Los Pinos, Pozuelo de Alarcón',
            'internal_notes'  => 'Boda de tarde. Lista de 38 fotos obligatorias. Piden drone.',
        ]);

        // ── Presupuestos e Facturas ──────────────────────────────────────

        // Boda Benítez — cobrada
        $q1 = Quote::create([
            'photo_session_id' => $s1->id,
            'status'           => QuoteStatus::Approved,
            'tax_rate'         => 21,
            'subtotal'         => 2644.63,
            'tax_amount'       => 555.37,
            'total'            => 3200.00,
            'valid_until'      => now()->subMonths(5)->toDateString(),
            'notes'            => 'Incluye álbum de 30x30cm tapa dura y galería online 12 meses.',
        ]);
        QuoteItem::create(['quote_id' => $q1->id, 'description' => 'Reportaje boda completo (10h)', 'quantity' => 1, 'unit_price' => 2200.00, 'subtotal' => 2200.00, 'order' => 0]);
        QuoteItem::create(['quote_id' => $q1->id, 'description' => 'Álbum premium 30×30cm tapa dura', 'quantity' => 1, 'unit_price' => 320.00, 'subtotal' => 320.00, 'order' => 1]);
        QuoteItem::create(['quote_id' => $q1->id, 'description' => 'Galería digital privada 12 meses', 'quantity' => 1, 'unit_price' => 90.00, 'subtotal' => 90.00, 'order' => 2]);
        QuoteItem::create(['quote_id' => $q1->id, 'description' => 'Desplazamiento a localización', 'quantity' => 1, 'unit_price' => 34.63, 'subtotal' => 34.63, 'order' => 3]);

        Invoice::create([
            'quote_id'         => $q1->id,
            'photo_session_id' => $s1->id,
            'invoice_number'   => 'FAC-2026-0001',
            'status'           => InvoiceStatus::Paid,
            'issue_date'       => now()->subMonths(4)->addDays(2)->toDateString(),
            'due_date'         => now()->subMonths(3)->toDateString(),
            'payment_date'     => now()->subMonths(3)->addDays(5)->toDateString(),
            'subtotal'         => 2644.63,
            'tax_rate'         => 21,
            'tax_amount'       => 555.37,
            'total'            => 3200.00,
            'notes'            => 'Pago recibido mediante transferencia bancaria.',
        ]);

        // Ríos corporativo — cobrada
        $q2 = Quote::create([
            'photo_session_id' => $s2->id,
            'status'           => QuoteStatus::Approved,
            'tax_rate'         => 21,
            'subtotal'         => 1528.93,
            'tax_amount'       => 321.07,
            'total'            => 1850.00,
            'valid_until'      => now()->subWeeks(7)->toDateString(),
        ]);
        QuoteItem::create(['quote_id' => $q2->id, 'description' => 'Sesión retratos corporativos (6h)', 'quantity' => 1, 'unit_price' => 1100.00, 'subtotal' => 1100.00, 'order' => 0]);
        QuoteItem::create(['quote_id' => $q2->id, 'description' => 'Retoque profesional por imagen', 'quantity' => 12, 'unit_price' => 28.93, 'subtotal' => 347.16, 'order' => 1]);
        QuoteItem::create(['quote_id' => $q2->id, 'description' => 'Licencia uso corporativo', 'quantity' => 1, 'unit_price' => 81.77, 'subtotal' => 81.77, 'order' => 2]);

        Invoice::create([
            'quote_id'         => $q2->id,
            'photo_session_id' => $s2->id,
            'invoice_number'   => 'FAC-2026-0002',
            'status'           => InvoiceStatus::Paid,
            'issue_date'       => now()->subWeeks(5)->toDateString(),
            'due_date'         => now()->subWeeks(2)->toDateString(),
            'payment_date'     => now()->subWeeks(2)->addDays(3)->toDateString(),
            'subtotal'         => 1528.93,
            'tax_rate'         => 21,
            'tax_amount'       => 321.07,
            'total'            => 1850.00,
        ]);

        // Gastronómica — pendiente de pago
        $q3 = Quote::create([
            'photo_session_id' => $s3->id,
            'status'           => QuoteStatus::Approved,
            'tax_rate'         => 21,
            'subtotal'         => 619.83,
            'tax_amount'       => 130.17,
            'total'            => 750.00,
            'valid_until'      => now()->addWeeks(2)->toDateString(),
        ]);
        QuoteItem::create(['quote_id' => $q3->id, 'description' => 'Fotografía gastronómica (1 día)', 'quantity' => 1, 'unit_price' => 500.00, 'subtotal' => 500.00, 'order' => 0]);
        QuoteItem::create(['quote_id' => $q3->id, 'description' => 'Edición y entrega 30 imágenes', 'quantity' => 30, 'unit_price' => 3.99, 'subtotal' => 119.70, 'order' => 1]);

        Invoice::create([
            'quote_id'         => $q3->id,
            'photo_session_id' => $s3->id,
            'invoice_number'   => 'FAC-2026-0003',
            'status'           => InvoiceStatus::Pending,
            'issue_date'       => now()->subWeeks(3)->toDateString(),
            'due_date'         => now()->addDays(7)->toDateString(),
            'subtotal'         => 619.83,
            'tax_rate'         => 21,
            'tax_amount'       => 130.17,
            'total'            => 750.00,
        ]);

        // Evento Tech — VENCIDA (hace 5 semanas, vence hace 3)
        $q4 = Quote::create([
            'photo_session_id' => $s4->id,
            'status'           => QuoteStatus::Approved,
            'tax_rate'         => 21,
            'subtotal'         => 991.74,
            'tax_amount'       => 208.26,
            'total'            => 1200.00,
        ]);
        QuoteItem::create(['quote_id' => $q4->id, 'description' => 'Cobertura evento completo (8h)', 'quantity' => 1, 'unit_price' => 800.00, 'subtotal' => 800.00, 'order' => 0]);
        QuoteItem::create(['quote_id' => $q4->id, 'description' => 'Edición exprés 48h (50 imágenes)', 'quantity' => 1, 'unit_price' => 191.74, 'subtotal' => 191.74, 'order' => 1]);

        Invoice::create([
            'quote_id'         => $q4->id,
            'photo_session_id' => $s4->id,
            'invoice_number'   => 'FAC-2026-0004',
            'status'           => InvoiceStatus::Overdue,
            'issue_date'       => now()->subWeeks(4)->toDateString(),
            'due_date'         => now()->subWeeks(2)->toDateString(),
            'subtotal'         => 991.74,
            'tax_rate'         => 21,
            'tax_amount'       => 208.26,
            'total'            => 1200.00,
            'notes'            => 'PENDIENTE. Segundo aviso enviado el ' . now()->subDays(5)->format('d/m/Y') . '.',
        ]);

        // Book Claudia — cobrada
        $q5 = Quote::create([
            'photo_session_id' => $s5->id,
            'status'           => QuoteStatus::Approved,
            'tax_rate'         => 21,
            'subtotal'         => 454.55,
            'tax_amount'       => 95.45,
            'total'            => 550.00,
        ]);
        QuoteItem::create(['quote_id' => $q5->id, 'description' => 'Sesión book modelo (4h, 4 looks)', 'quantity' => 1, 'unit_price' => 380.00, 'subtotal' => 380.00, 'order' => 0]);
        QuoteItem::create(['quote_id' => $q5->id, 'description' => 'Retoque 20 imágenes seleccionadas', 'quantity' => 20, 'unit_price' => 3.73, 'subtotal' => 74.55, 'order' => 1]);

        Invoice::create([
            'quote_id'         => $q5->id,
            'photo_session_id' => $s5->id,
            'invoice_number'   => 'FAC-2026-0005',
            'status'           => InvoiceStatus::Paid,
            'issue_date'       => now()->subMonth()->addDays(2)->toDateString(),
            'due_date'         => now()->subDays(10)->toDateString(),
            'payment_date'     => now()->subDays(8)->toDateString(),
            'subtotal'         => 454.55,
            'tax_rate'         => 21,
            'tax_amount'       => 95.45,
            'total'            => 550.00,
        ]);

        // Presupuesto próximas sesiones
        Quote::create([
            'photo_session_id' => $s10->id,
            'status'           => QuoteStatus::Sent,
            'tax_rate'         => 21,
            'subtotal'         => 2314.05,
            'tax_amount'       => 485.95,
            'total'            => 2800.00,
            'valid_until'      => now()->addWeeks(3)->toDateString(),
            'notes'            => 'Incluye drone DJI si el ayuntamiento concede el permiso de vuelo.',
        ]);

        Quote::create([
            'photo_session_id' => $s7->id,
            'status'           => QuoteStatus::Draft,
            'tax_rate'         => 21,
            'subtotal'         => 537.19,
            'tax_amount'       => 112.81,
            'total'            => 650.00,
            'valid_until'      => now()->addMonth()->toDateString(),
        ]);

        // ── Galerías ─────────────────────────────────────────────────────
        Gallery::create([
            'photo_session_id' => $s1->id,
            'name'             => 'Boda Benítez — Galería completa',
            'description'      => '284 fotografías de la boda. Selecciona tus favoritas para el álbum.',
            'access_token'     => Str::uuid()->toString(),
            'is_active'        => true,
        ]);

        Gallery::create([
            'photo_session_id' => $s2->id,
            'name'             => 'Retratos Corporativos — Inversiones Ríos',
            'description'      => 'Fotografías oficiales del equipo directivo y empleados.',
            'access_token'     => Str::uuid()->toString(),
            'is_active'        => true,
        ]);

        Gallery::create([
            'photo_session_id' => $s5->id,
            'name'             => 'Book Claudia Romero',
            'description'      => 'Selección final de 45 imágenes del book.',
            'access_token'     => Str::uuid()->toString(),
            'is_active'        => true,
        ]);

        // ── Equipamiento ─────────────────────────────────────────────────
        $equipmentData = [
            ['name' => 'Sony A7 IV', 'brand' => 'Sony', 'model' => 'ILCE-7M4', 'type' => 'camera', 'serial_number' => 'SN8810023', 'purchase_date' => '2022-04-15', 'purchase_price' => 2799.00, 'condition' => 'excellent', 'notes' => 'Cuerpo principal. +80.000 disparos.'],
            ['name' => 'Sony A7 III (backup)', 'brand' => 'Sony', 'model' => 'ILCE-7M3', 'type' => 'camera', 'serial_number' => 'SN6654321', 'purchase_date' => '2020-09-01', 'purchase_price' => 2199.00, 'condition' => 'good', 'notes' => 'Segunda cámara para eventos.'],
            ['name' => 'Sony FE 85mm f/1.4 GM', 'brand' => 'Sony', 'model' => 'SEL85F14GM', 'type' => 'lens', 'purchase_date' => '2022-06-20', 'purchase_price' => 1799.00, 'condition' => 'excellent', 'notes' => 'Objetivo principal para retratos. Impresionante bokeh.'],
            ['name' => 'Sony FE 24-70mm f/2.8 GM II', 'brand' => 'Sony', 'model' => 'SEL2470GM2', 'type' => 'lens', 'purchase_date' => '2023-01-10', 'purchase_price' => 2299.00, 'condition' => 'excellent', 'notes' => 'Objetivo todoterreno para bodas y eventos.'],
            ['name' => 'Sony FE 16-35mm f/2.8 GM', 'brand' => 'Sony', 'model' => 'SEL1635GM', 'type' => 'lens', 'purchase_date' => '2021-03-05', 'purchase_price' => 2399.00, 'condition' => 'good', 'notes' => 'Gran angular para exteriores y localizaciones.'],
            ['name' => 'Sony FE 70-200mm f/2.8 GM OSS II', 'brand' => 'Sony', 'model' => 'SEL70200GM2', 'type' => 'lens', 'purchase_date' => '2023-08-15', 'purchase_price' => 2699.00, 'condition' => 'excellent'],
            ['name' => 'Godox V1 Flash Sony', 'brand' => 'Godox', 'model' => 'V1-S', 'type' => 'lighting', 'purchase_date' => '2021-11-20', 'purchase_price' => 189.00, 'condition' => 'good', 'notes' => 'Flash de zapata. 2 unidades en total.'],
            ['name' => 'Godox AD600Pro Strobe', 'brand' => 'Godox', 'model' => 'AD600Pro', 'type' => 'lighting', 'purchase_date' => '2022-02-14', 'purchase_price' => 599.00, 'condition' => 'good', 'notes' => 'Flash portátil para estudio exterior.'],
            ['name' => 'Profoto B10 Plus', 'brand' => 'Profoto', 'model' => 'B10 Plus', 'type' => 'lighting', 'purchase_date' => '2023-04-01', 'purchase_price' => 1549.00, 'condition' => 'excellent', 'notes' => 'Flash estudio principal.'],
            ['name' => 'Trípode Gitzo Systematic GT3543', 'brand' => 'Gitzo', 'model' => 'GT3543', 'type' => 'tripod', 'purchase_date' => '2020-07-10', 'purchase_price' => 649.00, 'condition' => 'good'],
            ['name' => 'Monopié Manfrotto 685B', 'brand' => 'Manfrotto', 'model' => '685B', 'type' => 'tripod', 'purchase_date' => '2021-05-20', 'purchase_price' => 89.00, 'condition' => 'good'],
            ['name' => 'DJI Mavic 3 Pro', 'brand' => 'DJI', 'model' => 'Mavic 3 Pro', 'type' => 'accessory', 'serial_number' => 'DJI0001234', 'purchase_date' => '2023-09-01', 'purchase_price' => 2199.00, 'condition' => 'excellent', 'notes' => 'Dron para aéreos. Requiere permiso AESA para eventos.'],
            ['name' => 'Tarjetas Sony SF-G 128GB v2', 'brand' => 'Sony', 'model' => 'SF-G128T', 'type' => 'accessory', 'purchase_date' => '2022-04-15', 'purchase_price' => 169.00, 'condition' => 'good', 'notes' => '4 unidades. Velocidad 300MB/s.'],
            ['name' => 'Mochila Think Tank PhotoCross 20', 'brand' => 'Think Tank', 'model' => 'PhotoCross 20', 'type' => 'bag', 'purchase_date' => '2022-01-15', 'purchase_price' => 179.00, 'condition' => 'good'],
        ];

        $equipment = [];
        foreach ($equipmentData as $eq) {
            $equipment[] = Equipment::create(array_merge($eq, ['photographer_id' => $photographer->id, 'is_active' => true]));
        }
        // $equipment[0] = Sony A7 IV (principal), $equipment[1] = Sony A7 III (backup)
        $cam1 = $equipment[0]->id; // Sony A7 IV
        $cam2 = $equipment[1]->id; // Sony A7 III

        // ── Presets ───────────────────────────────────────────────────────
        $presetsData = [
            ['equipment_id' => $cam1, 'name' => 'Golden Hour Bodas', 'category' => 'Bodas', 'iso' => '400', 'aperture' => '1.8', 'shutter_speed' => '1/200', 'white_balance' => '5600K', 'exposure_compensation' => 0, 'notes' => 'Perfecto para exteriores al atardecer. Añade calidez natural a los tonos piel.'],
            ['equipment_id' => $cam1, 'name' => 'Ceremonia Interior', 'category' => 'Bodas', 'iso' => '3200', 'aperture' => '1.4', 'shutter_speed' => '1/100', 'white_balance' => '3800K', 'exposure_compensation' => 1, 'notes' => 'Para iglesias y salones con poca luz. Cuidado con el ruido en sombras.'],
            ['equipment_id' => $cam1, 'name' => 'Retrato Natural Exterior', 'category' => 'Retrato', 'iso' => '200', 'aperture' => '2.0', 'shutter_speed' => '1/500', 'white_balance' => 'Auto', 'exposure_compensation' => 0, 'notes' => 'Luz de día nublado. Difusor natural. Ideal para retratos suaves.'],
            ['equipment_id' => $cam1, 'name' => 'Retrato Estudio Blanco', 'category' => 'Retrato', 'iso' => '100', 'aperture' => '8.0', 'shutter_speed' => '1/160', 'white_balance' => '5500K', 'exposure_compensation' => 0, 'notes' => 'Fondo blanco con Profoto. Setup 3 puntos de luz.'],
            ['equipment_id' => $cam2, 'name' => 'BN Dramático Evento', 'category' => 'Evento', 'iso' => '1600', 'aperture' => '2.8', 'shutter_speed' => '1/250', 'white_balance' => 'Auto', 'exposure_compensation' => -1, 'notes' => 'Blanco y negro en postpro. Alto contraste. Muy impactante para discursos.'],
            ['equipment_id' => $cam2, 'name' => 'Producto Mesa Luz', 'category' => 'Producto', 'iso' => '100', 'aperture' => '11.0', 'shutter_speed' => '1/125', 'white_balance' => '5000K', 'exposure_compensation' => 0, 'notes' => 'Mesa de luz LED + rebotador. Objetos pequeños. Máxima nitidez.'],
            ['equipment_id' => $cam2, 'name' => 'Food Editorial', 'category' => 'Gastronomía', 'iso' => '200', 'aperture' => '3.2', 'shutter_speed' => '1/200', 'white_balance' => '5200K', 'exposure_compensation' => 1, 'notes' => 'Luz ventana lateral + reflector. Bokeh suave en fondos.'],
            ['equipment_id' => $cam2, 'name' => 'Blue Hour Paisaje', 'category' => 'Paisaje', 'iso' => '800', 'aperture' => '8.0', 'shutter_speed' => '1/30', 'white_balance' => '4500K', 'exposure_compensation' => 0, 'notes' => 'Trípode obligatorio. 20-30min tras atardecer. Tonos azules puros.'],
        ];

        foreach ($presetsData as $preset) {
            Preset::create(array_merge($preset, ['photographer_id' => $photographer->id]));
        }

        // ── Localizaciones ────────────────────────────────────────────────
        $locationsData = [
            ['name' => 'Parque del Retiro', 'latitude' => 40.4153, 'longitude' => -3.6844, 'category' => 'Parque urbano', 'address' => 'Plaza de la Independencia, Madrid', 'description' => 'Icónico parque de Madrid. Estanque y rosaleda perfectos para retratos. Mejor al amanecer antes de las 9h para evitar turistas.'],
            ['name' => 'Jardines de Aranjuez', 'latitude' => 40.0353, 'longitude' => -3.6025, 'category' => 'Jardín histórico', 'address' => 'Palacio Real de Aranjuez, Aranjuez', 'description' => 'Jardines del Parterre y del Príncipe. Luz perfecta a primera hora de la tarde. Ideal para prebodas y retratos románticos.'],
            ['name' => 'Acueducto de Segovia', 'latitude' => 40.9482, 'longitude' => -4.1183, 'category' => 'Monumento', 'address' => 'Plaza del Azoguejo, Segovia', 'description' => 'Perspectivas únicas del acueducto romano. La calle de la Judería da fondos espectaculares. Parking en el Alcázar.'],
            ['name' => 'Playa de la Concha', 'latitude' => 43.3173, 'longitude' => -1.9865, 'category' => 'Playa', 'address' => 'Paseo de la Concha, San Sebastián', 'description' => 'Mejor playa de España para fotografía. La Isla de Santa Clara como telón de fondo. Luz dorada increíble al atardecer.'],
            ['name' => 'La Alhambra', 'latitude' => 37.1760, 'longitude' => -3.5881, 'category' => 'Monumento', 'address' => 'C. Real de la Alhambra, Granada', 'description' => 'Acceso con permiso especial para profesionales. Los Generalife ofrecen luz suave toda la mañana. Espectacular para bodas.'],
            ['name' => 'Estudio Vidal — Interior', 'latitude' => 40.4244, 'longitude' => -3.7024, 'category' => 'Estudio', 'address' => 'Calle Fuencarral 92, Madrid', 'description' => 'Estudio propio. 60m². 2 fondos (blanco/gris). Zona natural ventana norte. Equipamiento Profoto completo.'],
            ['name' => 'Finca El Encinar', 'latitude' => 40.4891, 'longitude' => -3.3650, 'category' => 'Finca eventos', 'address' => 'Carretera de Anchuelo km 3, Alcalá de Henares', 'description' => 'Finca para bodas con robledal centenario. 15 hectáreas. Piscina y jardín inglés. Luz perfecta todo el día.'],
            ['name' => 'Sierra de Guadarrama', 'latitude' => 40.7945, 'longitude' => -3.9778, 'category' => 'Naturaleza', 'address' => 'Puerto de Navacerrada, Madrid', 'description' => 'Paisajes de alta montaña. Pinar de Valsaín espectacular en otoño. Golden hour brutal a 1800m de altitud.'],
        ];

        foreach ($locationsData as $loc) {
            Location::create(array_merge($loc, ['photographer_id' => $photographer->id]));
        }

        // ── Moodboards ────────────────────────────────────────────────────
        $moodboardsData = [
            ['name' => 'Bodas 2026 — Elegancia Natural', 'folder' => 'Bodas', 'description' => 'Paleta cálida, tonos nude y blanco roto. Flores silvestres. Estilo editorial rústico-chic.'],
            ['name' => 'Bodas 2026 — Minimalismo Moderno', 'folder' => 'Bodas', 'description' => 'Geometría. Fondos limpios. Blanco puro. Influencia escandinava.'],
            ['name' => 'Retratos Otoño 2026', 'folder' => 'Retratos', 'description' => 'Colores tierra, ocres y rojizos. Bosques con follaje. Luz dorada rasante.'],
            ['name' => 'Book Claudia — Referencias', 'folder' => 'Retratos', 'description' => 'High fashion + editorial. Mezcla BN dramático y color vibrante.'],
            ['name' => 'Fotografía Gastronómica', 'folder' => 'Producto', 'description' => 'Estilo editorial food. Fondos de piedra y madera. Hierbas aromáticas frescas.'],
            ['name' => 'Inspiración Drone Otoño', 'folder' => 'Paisaje', 'description' => 'Vistas aéreas de dehesas, viñedos y montaña. Paleta fría con contraluces.'],
        ];

        foreach ($moodboardsData as $mb) {
            Moodboard::create(array_merge($mb, ['photographer_id' => $photographer->id]));
        }
    }
}
