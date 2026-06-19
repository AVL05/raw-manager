<?php

namespace App\Http\Controllers\Api;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        // Marcar como vencidas las facturas pendientes cuyo plazo ha pasado
        Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $request->user()->id))
            ->where('status', InvoiceStatus::Pending->value)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => InvoiceStatus::Overdue->value]);

        $invoices = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $request->user()->id))
            ->with(['photoSession.client'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByDesc('issue_date')
            ->paginate($request->get('per_page', 15));

        return InvoiceResource::collection($invoices);
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->invoiceService->createFromQuote($request->validated(), $request->user());

        return response()->json(new InvoiceResource($invoice->load('photoSession.client')), 201);
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize($request, $invoice);

        return response()->json(new InvoiceResource($invoice->load('photoSession.client')));
    }

    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize($request, $invoice);

        $request->validate(['status' => ['required', new Enum(InvoiceStatus::class)]]);

        $data = ['status' => $request->status];
        if ($request->status === InvoiceStatus::Paid->value) {
            $data['payment_date'] = now()->toDateString();
        }

        $invoice->update($data);

        return response()->json(new InvoiceResource($invoice));
    }

    public function pdf(Request $request, Invoice $invoice): mixed
    {
        $this->authorize($request, $invoice);

        return $this->invoiceService->generatePdf($invoice->load('photoSession.client'));
    }

    private function authorize(Request $request, Invoice $invoice): void
    {
        abort_if($invoice->photoSession->photographer_id !== $request->user()->id, 403, 'No autorizado.');
    }
}