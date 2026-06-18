<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Quote;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function createFromQuote(array $data, User $photographer): Invoice
    {
        $quote = Quote::with('photoSession')->findOrFail($data['quote_id']);

        abort_if($quote->photoSession->photographer_id !== $photographer->id, 403, 'No autorizado.');

        $number = $this->generateInvoiceNumber($photographer->id);

        return Invoice::create([
            'quote_id' => $quote->id,
            'photo_session_id' => $quote->photo_session_id,
            'invoice_number' => $number,
            'issue_date' => now()->toDateString(),
            'due_date' => $data['due_date'] ?? now()->addDays(30)->toDateString(),
            'subtotal' => $quote->subtotal,
            'tax_rate' => $quote->tax_rate,
            'tax_amount' => $quote->tax_amount,
            'total' => $quote->total,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    public function generatePdf(Invoice $invoice): mixed
    {
        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);

        $filename = 'invoices/invoice-' . $invoice->id . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());
        $invoice->update(['pdf_path' => $filename]);

        return $pdf->download('factura-' . $invoice->invoice_number . '.pdf');
    }

    private function generateInvoiceNumber(int $photographerId): string
    {
        $year = now()->year;
        $count = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $photographerId))
            ->whereYear('created_at', $year)
            ->count();

        return sprintf('FAC-%d-%04d', $year, $count + 1);
    }
}