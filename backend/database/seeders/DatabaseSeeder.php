<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Enums\QuoteStatus;
use App\Enums\SessionStatus;
use App\Enums\SessionType;
use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Gallery;
use App\Models\Invoice;
use App\Models\PhotoSession;
use App\Models\PhotographerProfile;
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
        $photographer = User::create([
            'name' => 'Alex Martin',
            'email' => 'photographer@demo.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Photographer,
            'phone' => '+34 612 345 678',
        ]);

        PhotographerProfile::create([
            'user_id' => $photographer->id,
            'business_name' => 'Alex Martin Photography',
            'nif' => '12345678A',
            'address' => 'Calle Mayor 23',
            'city' => 'Madrid',
            'postal_code' => '28013',
            'country' => 'Espana',
            'bio' => 'Fotografo profesional especializado en bodas, retratos y eventos.',
            'instagram' => '@alexmartinphoto',
        ]);

        User::create([
            'name' => 'Maria Garcia',
            'email' => 'client@demo.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Client,
        ]);

        $clientsData = [
            ['name' => 'Maria Garcia', 'email' => 'maria@example.com', 'phone' => '+34 611 111 111', 'city' => 'Madrid', 'nif' => '87654321B'],
            ['name' => 'Carlos Lopez', 'email' => 'carlos@example.com', 'phone' => '+34 622 222 222', 'city' => 'Barcelona'],
            ['name' => 'Ana Martinez', 'email' => 'ana@example.com', 'phone' => '+34 633 333 333', 'city' => 'Valencia'],
            ['name' => 'Pedro Sanchez', 'email' => 'pedro@example.com', 'phone' => '+34 644 444 444', 'city' => 'Sevilla'],
            ['name' => 'Laura Ruiz', 'email' => 'laura@example.com', 'phone' => '+34 655 555 555', 'city' => 'Bilbao'],
        ];

        $clients = [];
        foreach ($clientsData as $cd) {
            $clients[] = Client::create(array_merge($cd, ['photographer_id' => $photographer->id]));
        }

        $session1 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id' => $clients[0]->id,
            'name' => 'Boda Garcia-Lopez',
            'type' => SessionType::Wedding,
            'status' => SessionStatus::Delivered,
            'price' => 2500,
            'date' => now()->subMonths(2)->toDateString(),
            'location' => 'Finca El Encinar, Madrid',
        ]);

        $session2 = PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id' => $clients[1]->id,
            'name' => 'Retrato corporativo Carlos',
            'type' => SessionType::Portrait,
            'status' => SessionStatus::Done,
            'price' => 350,
            'date' => now()->subWeeks(3)->toDateString(),
            'location' => 'Estudio Propio, Madrid',
        ]);

        PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id' => $clients[2]->id,
            'name' => 'Producto cosmetica Ana',
            'type' => SessionType::Product,
            'status' => SessionStatus::Confirmed,
            'price' => 600,
            'date' => now()->addDays(5)->toDateString(),
            'location' => 'Estudio B, Valencia',
        ]);

        PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id' => $clients[3]->id,
            'name' => 'Evento empresa Sanchez Co',
            'type' => SessionType::Event,
            'status' => SessionStatus::Pending,
            'price' => 900,
            'date' => now()->addWeeks(2)->toDateString(),
            'location' => 'Hotel Melia, Sevilla',
        ]);

        PhotoSession::create([
            'photographer_id' => $photographer->id,
            'client_id' => $clients[0]->id,
            'name' => 'Preboda Garcia-Lopez',
            'type' => SessionType::Portrait,
            'status' => SessionStatus::Confirmed,
            'price' => 400,
            'date' => now()->addDays(10)->toDateString(),
            'location' => 'Jardines de Aranjuez',
        ]);

        $quote1 = Quote::create([
            'photo_session_id' => $session1->id,
            'status' => QuoteStatus::Approved,
            'tax_rate' => 21,
            'subtotal' => 2066.12,
            'tax_amount' => 433.88,
            'total' => 2500,
        ]);
        QuoteItem::create(['quote_id' => $quote1->id, 'description' => 'Reportaje boda completo (8h)', 'quantity' => 1, 'unit_price' => 1800, 'subtotal' => 1800, 'order' => 0]);
        QuoteItem::create(['quote_id' => $quote1->id, 'description' => 'Album premium 30x30cm', 'quantity' => 1, 'unit_price' => 180, 'subtotal' => 180, 'order' => 1]);
        QuoteItem::create(['quote_id' => $quote1->id, 'description' => 'Desplazamiento', 'quantity' => 1, 'unit_price' => 86.12, 'subtotal' => 86.12, 'order' => 2]);

        Invoice::create([
            'quote_id' => $quote1->id,
            'photo_session_id' => $session1->id,
            'invoice_number' => 'FAC-' . now()->year . '-0001',
            'status' => InvoiceStatus::Paid,
            'issue_date' => now()->subMonths(2)->addDays(5)->toDateString(),
            'due_date' => now()->subMonths(2)->addDays(35)->toDateString(),
            'payment_date' => now()->subMonths(2)->addDays(20)->toDateString(),
            'subtotal' => 2066.12,
            'tax_rate' => 21,
            'tax_amount' => 433.88,
            'total' => 2500,
        ]);

        $quote2 = Quote::create([
            'photo_session_id' => $session2->id,
            'status' => QuoteStatus::Approved,
            'tax_rate' => 21,
            'subtotal' => 289.26,
            'tax_amount' => 60.74,
            'total' => 350,
        ]);
        QuoteItem::create(['quote_id' => $quote2->id, 'description' => 'Sesion retrato corporativo (2h)', 'quantity' => 1, 'unit_price' => 200, 'subtotal' => 200, 'order' => 0]);
        QuoteItem::create(['quote_id' => $quote2->id, 'description' => 'Retoque 10 imagenes', 'quantity' => 10, 'unit_price' => 8.93, 'subtotal' => 89.3, 'order' => 1]);

        Invoice::create([
            'quote_id' => $quote2->id,
            'photo_session_id' => $session2->id,
            'invoice_number' => 'FAC-' . now()->year . '-0002',
            'status' => InvoiceStatus::Pending,
            'issue_date' => now()->subWeeks(2)->toDateString(),
            'due_date' => now()->addDays(15)->toDateString(),
            'subtotal' => 289.26,
            'tax_rate' => 21,
            'tax_amount' => 60.74,
            'total' => 350,
        ]);

        Gallery::create([
            'photo_session_id' => $session1->id,
            'name' => 'Boda Garcia-Lopez - Galeria completa',
            'description' => 'Seleccion de las mejores fotos de la boda.',
            'access_token' => Str::uuid()->toString(),
            'is_active' => true,
        ]);
    }
}