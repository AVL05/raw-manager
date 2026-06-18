<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 0; }
  .page { padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #111; padding-bottom: 20px; }
  .logo-area h1 { font-size: 24px; font-weight: bold; margin: 0; }
  .logo-area p { color: #666; margin: 4px 0 0; }
  .doc-info { text-align: right; }
  .doc-info h2 { font-size: 20px; color: #111; margin: 0 0 8px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold; }
  .badge-draft { background: #e5e7eb; color: #374151; }
  .badge-sent { background: #dbeafe; color: #1d4ed8; }
  .badge-approved { background: #d1fae5; color: #065f46; }
  .badge-rejected { background: #fee2e2; color: #991b1b; }
  .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .party { width: 48%; }
  .party h3 { font-size: 11px; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px; }
  .party p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #111; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:last-child td { border-bottom: none; }
  .totals { margin-left: auto; width: 280px; margin-top: 10px; }
  .totals table { margin: 0; }
  .totals td { padding: 6px 10px; }
  .totals .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #111; }
  .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <h1>{{ $quote->photoSession->photographer->photographerProfile->business_name ?? $quote->photoSession->photographer->name }}</h1>
      @if($quote->photoSession->photographer->photographerProfile->nif)
        <p>NIF: {{ $quote->photoSession->photographer->photographerProfile->nif }}</p>
      @endif
      @if($quote->photoSession->photographer->photographerProfile->address)
        <p>{{ $quote->photoSession->photographer->photographerProfile->address }}, {{ $quote->photoSession->photographer->photographerProfile->city }}</p>
      @endif
      <p>{{ $quote->photoSession->photographer->email }}</p>
    </div>
    <div class="doc-info">
      <h2>PRESUPUESTO #{{ $quote->id }}</h2>
      <span class="badge badge-{{ $quote->status->value }}">{{ strtoupper($quote->status->value) }}</span>
      <p style="margin-top:8px">Fecha: {{ now()->format('d/m/Y') }}</p>
      @if($quote->valid_until)
        <p>Válido hasta: {{ $quote->valid_until->format('d/m/Y') }}</p>
      @endif
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Sesión</h3>
      <p><strong>{{ $quote->photoSession->name }}</strong></p>
      <p>Fecha: {{ $quote->photoSession->date->format('d/m/Y') }}</p>
      @if($quote->photoSession->location)
        <p>Lugar: {{ $quote->photoSession->location }}</p>
      @endif
    </div>
    <div class="party">
      <h3>Cliente</h3>
      <p><strong>{{ $quote->photoSession->client->name }}</strong></p>
      @if($quote->photoSession->client->email)
        <p>{{ $quote->photoSession->client->email }}</p>
      @endif
      @if($quote->photoSession->client->phone)
        <p>{{ $quote->photoSession->client->phone }}</p>
      @endif
      @if($quote->photoSession->client->nif)
        <p>NIF: {{ $quote->photoSession->client->nif }}</p>
      @endif
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50%">Descripción</th>
        <th style="text-align:center">Cantidad</th>
        <th style="text-align:right">Precio unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($quote->items as $item)
      <tr>
        <td>{{ $item->description }}</td>
        <td style="text-align:center">{{ number_format($item->quantity, 2) }}</td>
        <td style="text-align:right">{{ number_format($item->unit_price, 2) }} €</td>
        <td style="text-align:right">{{ number_format($item->subtotal, 2) }} €</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Base imponible</td><td style="text-align:right">{{ number_format($quote->subtotal, 2) }} €</td></tr>
      <tr><td>IVA ({{ number_format($quote->tax_rate, 0) }}%)</td><td style="text-align:right">{{ number_format($quote->tax_amount, 2) }} €</td></tr>
      <tr class="total-row"><td>TOTAL</td><td style="text-align:right">{{ number_format($quote->total, 2) }} €</td></tr>
    </table>
  </div>

  @if($quote->notes)
    <div style="margin-top:30px; padding:15px; background:#f9fafb; border-radius:4px;">
      <strong>Notas:</strong><br>{{ $quote->notes }}
    </div>
  @endif

  <div class="footer">Documento generado por RAW Manager</div>
</div>
</body>
</html>