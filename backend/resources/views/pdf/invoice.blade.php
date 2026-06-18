<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 0; }
  .page { padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #111; padding-bottom: 20px; }
  .logo-area h1 { font-size: 24px; font-weight: bold; margin: 0; }
  .doc-info { text-align: right; }
  .doc-info h2 { font-size: 20px; color: #111; margin: 0 0 8px; }
  .badge-paid { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold; background: #d1fae5; color: #065f46; }
  .badge-pending { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold; background: #fef3c7; color: #92400e; }
  .badge-overdue { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold; background: #fee2e2; color: #991b1b; }
  .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .party { width: 48%; }
  .party h3 { font-size: 11px; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #111; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  .totals { margin-left: auto; width: 280px; margin-top: 10px; }
  .totals table { margin: 0; }
  .totals .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #111; }
  .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  .paid-stamp { border: 3px solid #059669; color: #059669; padding: 5px 15px; font-size: 20px; font-weight: bold; transform: rotate(-15deg); display: inline-block; margin-top: 15px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <h1>{{ $invoice->photoSession->photographer->photographerProfile->business_name ?? $invoice->photoSession->photographer->name }}</h1>
      @if($invoice->photoSession->photographer->photographerProfile->nif ?? false)
        <p>NIF: {{ $invoice->photoSession->photographer->photographerProfile->nif }}</p>
      @endif
    </div>
    <div class="doc-info">
      <h2>FACTURA {{ $invoice->invoice_number }}</h2>
      <span class="badge-{{ $invoice->status->value }}">{{ strtoupper($invoice->status->value) }}</span>
      <p style="margin-top:8px">Emisión: {{ $invoice->issue_date->format('d/m/Y') }}</p>
      @if($invoice->due_date)<p>Vencimiento: {{ $invoice->due_date->format('d/m/Y') }}</p>@endif
      @if($invoice->payment_date)<p>Pagada: {{ $invoice->payment_date->format('d/m/Y') }}</p>@endif
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Fotógrafo</h3>
      <p><strong>{{ $invoice->photoSession->photographer->name }}</strong></p>
      <p>{{ $invoice->photoSession->photographer->email }}</p>
    </div>
    <div class="party">
      <h3>Cliente</h3>
      <p><strong>{{ $invoice->photoSession->client->name }}</strong></p>
      @if($invoice->photoSession->client->email)<p>{{ $invoice->photoSession->client->email }}</p>@endif
      @if($invoice->photoSession->client->nif)<p>NIF: {{ $invoice->photoSession->client->nif }}</p>@endif
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th style="text-align:right">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ $invoice->photoSession->name }} — Servicios fotográficos</td>
        <td style="text-align:right">{{ number_format($invoice->subtotal, 2) }} €</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Base imponible</td><td style="text-align:right">{{ number_format($invoice->subtotal, 2) }} €</td></tr>
      <tr><td>IVA ({{ number_format($invoice->tax_rate, 0) }}%)</td><td style="text-align:right">{{ number_format($invoice->tax_amount, 2) }} €</td></tr>
      <tr class="total-row"><td>TOTAL</td><td style="text-align:right">{{ number_format($invoice->total, 2) }} €</td></tr>
    </table>
  </div>

  @if($invoice->status->value === 'paid')
    <div style="text-align:center; margin-top: 20px;">
      <span class="paid-stamp">PAGADA</span>
    </div>
  @endif

  <div class="footer">Documento generado por RAW Manager · {{ config('app.name') }}</div>
</div>
</body>
</html>