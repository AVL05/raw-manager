<?php

namespace App\Http\Controllers\Api;

use App\Enums\InvoiceStatus;
use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PhotoSessionResource;
use App\Models\Invoice;
use App\Models\PhotoSession;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Una sola query con JOIN para todas las métricas de facturas
        $invoiceStats = DB::table('invoices')
            ->join('photo_sessions', 'invoices.photo_session_id', '=', 'photo_sessions.id')
            ->where('photo_sessions.photographer_id', $userId)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN invoices.status = ? THEN invoices.total ELSE 0 END), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN invoices.status = ? THEN invoices.total ELSE 0 END), 0) as pending_revenue,
                COUNT(CASE WHEN invoices.status = ? THEN 1 END) as pending_invoices,
                COUNT(CASE WHEN invoices.status = ? THEN 1 END) as overdue_invoices
            ", [
                InvoiceStatus::Paid->value,
                InvoiceStatus::Pending->value,
                InvoiceStatus::Pending->value,
                InvoiceStatus::Overdue->value,
            ])
            ->first();

        // Una query para métricas de sesiones
        $sessionStats = DB::table('photo_sessions')
            ->where('photographer_id', $userId)
            ->selectRaw("
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN status IN (?, ?) THEN 1 END) as pending_sessions
            ", [SessionStatus::Pending->value, SessionStatus::Confirmed->value ?? SessionStatus::Pending->value])
            ->first();

        $activeClients = Client::where('photographer_id', $userId)->count();

        return response()->json([
            'total_revenue'    => round($invoiceStats->total_revenue, 2),
            'pending_revenue'  => round($invoiceStats->pending_revenue, 2),
            'active_clients'   => $activeClients,
            'pending_sessions' => (int) $sessionStats->pending_sessions,
            'pending_invoices' => (int) $invoiceStats->pending_invoices,
            'overdue_invoices' => (int) $invoiceStats->overdue_invoices,
            'total_sessions'   => (int) $sessionStats->total_sessions,
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
        $invoices = Invoice::join('photo_sessions', 'invoices.photo_session_id', '=', 'photo_sessions.id')
            ->where('photo_sessions.photographer_id', $request->user()->id)
            ->select('invoices.*')
            ->with('photoSession.client:id,name,email')
            ->orderByDesc('invoices.created_at')
            ->limit(5)
            ->get();

        return response()->json(InvoiceResource::collection($invoices));
    }
}
