<?php

namespace App\Services;

use App\Models\PhotoSession;
use App\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class QuoteService
{
    public function createQuote(PhotoSession $session, array $data): Quote
    {
        $quote = Quote::create([
            'photo_session_id' => $session->id,
            'tax_rate' => $data['tax_rate'] ?? 21.00,
            'valid_until' => $data['valid_until'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $index => $item) {
            $quote->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'subtotal' => round($item['quantity'] * $item['unit_price'], 2),
                'order' => $index,
            ]);
        }

        $quote->recalculate();

        return $quote->fresh(['items']);
    }

    public function updateQuote(Quote $quote, array $data): Quote
    {
        $quote->update(array_filter([
            'tax_rate' => $data['tax_rate'] ?? null,
            'valid_until' => $data['valid_until'] ?? null,
            'notes' => $data['notes'] ?? null,
        ], fn($v) => $v !== null));

        if (isset($data['items'])) {
            $quote->items()->delete();

            foreach ($data['items'] as $index => $item) {
                $quote->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => round($item['quantity'] * $item['unit_price'], 2),
                    'order' => $index,
                ]);
            }

            $quote->recalculate();
        }

        return $quote->fresh(['items']);
    }

    public function generatePdf(Quote $quote): mixed
    {
        $pdf = Pdf::loadView('pdf.quote', ['quote' => $quote]);

        $filename = 'quotes/quote-' . $quote->id . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());
        $quote->update(['pdf_path' => $filename]);

        return $pdf->download('presupuesto-' . $quote->id . '.pdf');
    }
}