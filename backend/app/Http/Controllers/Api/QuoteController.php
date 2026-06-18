<?php

namespace App\Http\Controllers\Api;

use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Quote\StoreQuoteRequest;
use App\Http\Requests\Quote\UpdateQuoteRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Quote;
use App\Models\PhotoSession;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class QuoteController extends Controller
{
    public function __construct(private QuoteService $quoteService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $quotes = Quote::whereHas('photoSession', fn($q) => $q->where('photographer_id', $request->user()->id))
            ->with(['photoSession.client'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return QuoteResource::collection($quotes);
    }

    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $session = PhotoSession::findOrFail($request->photo_session_id);
        abort_if($session->photographer_id !== $request->user()->id, 403);

        $quote = $this->quoteService->createQuote($session, $request->validated());

        return response()->json(new QuoteResource($quote->load('items')), 201);
    }

    public function show(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize($request, $quote);

        return response()->json(new QuoteResource($quote->load(['items', 'photoSession.client'])));
    }

    public function update(UpdateQuoteRequest $request, Quote $quote): JsonResponse
    {
        $this->authorize($request, $quote);

        $quote = $this->quoteService->updateQuote($quote, $request->validated());

        return response()->json(new QuoteResource($quote->load('items')));
    }

    public function destroy(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize($request, $quote);

        $quote->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize($request, $quote);

        $request->validate(['status' => ['required', new Enum(QuoteStatus::class)]]);

        $quote->update(['status' => $request->status]);

        return response()->json(new QuoteResource($quote));
    }

    public function pdf(Request $request, Quote $quote): mixed
    {
        $this->authorize($request, $quote);

        return $this->quoteService->generatePdf($quote->load(['items', 'photoSession.client']));
    }

    private function authorize(Request $request, Quote $quote): void
    {
        abort_if($quote->photoSession->photographer_id !== $request->user()->id, 403, 'No autorizado.');
    }
}