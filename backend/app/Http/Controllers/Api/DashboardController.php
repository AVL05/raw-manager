<?php

namespace App\Http\Controllers\Api;

use App\Enums\InvoiceStatus;
use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PhotoSessionResource;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\PhotoSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totalRevenue = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $userId))
            ->where('status', InvoiceStatus::Paid)
            ->sum('total');

        $pendingRevenue = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $userId))
            ->where('status', InvoiceStatus::Pending)
            ->sum('total');

        $activeClients = Client::where('photographer_id', $userId)->count();

        $pendingSessions = PhotoSession::where('photographer_id', $userId)
            ->whereIn('status', [SessionStatus::Pending->value, SessionStatus::Confirmed->value])
            ->count();

        $pendingInvoices = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $userId))
            ->where('status', InvoiceStatus::Pending)
            ->count();

        $overdueInvoices = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $userId))
            ->where('status', InvoiceStatus::Overdue)
            ->count();

        $totalSessions = PhotoSession::where('photographer_id', $userId)->count();

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'pending_revenue' => round($pendingRevenue, 2),
            'active_clients' => $activeClients,
            'pending_sessions' => $pendingSessions,
            'pending_invoices' => $pendingInvoices,
            'overdue_invoices' => $overdueInvoices,
            'total_sessions' => $totalSessions,
        ]);
    }

    public function upcomingSessions(Request $request): JsonResponse
    {
        $sessions = PhotoSession::where('photographer_id', $request->user()->id)
            ->whereIn('status', [SessionStatus::Pending->value, SessionStatus::Confirmed->value])
            ->where('date', '>=', now()->toDateString())
            ->with('client')
            ->orderBy('date')
            ->limit(5)
            ->get();

        return response()->json(PhotoSessionResource::collection($sessions));
    }

    public function recentInvoices(Request $request): JsonResponse
    {
        $invoices = Invoice::whereHas('photoSession', fn($q) => $q->where('photographer_id', $request->user()->id))
            ->with('photoSession.client')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json(InvoiceResource::collection($invoices));
    }
}