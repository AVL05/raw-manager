<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
  .page { padding: 48pt; }

  .header { width: 100%; border-bottom: 2pt solid #1a1a1a; padding-bottom: 20pt; margin-bottom: 24pt; }
  .header td { vertical-align: top; }
  .biz-name { font-size: 18pt; font-weight: bold; color: #1a1a1a; margin-bottom: 4pt; }
  .biz-detail { font-size: 9pt; color: #555; margin-top: 3pt; }
  .doc-title { font-size: 16pt; font-weight: bold; text-align: right; }
  .doc-meta { font-size: 9pt; color: #555; text-align: right; margin-top: 3pt; }

  .badge { font-size: 8pt; font-weight: bold; padding: 2pt 8pt; border-radius: 2pt; }
  .badge-draft    { background: #e5e7eb; color: #374151; }
  .badge-sent     { background: #dbeafe; color: #1d4ed8; }
  .badge-approved { background: #d1fae5; color: #065f46; }
  .badge-rejected { background: #fee2e2; color: #991b1b; }

  .section-label { font-size: 8pt; font-weight: bold; text-transform: uppercase;
                   color: #888; letter-spacing: 0.5pt; margin-bottom: 5pt; }
  .section-name  { font-size: 11pt; font-weight: bold; margin-bottom: 2pt; }
  .section-detail{ font-size: 9pt; color: #555; margin-top: 2pt; }

  table { border-collapse: collapse; }

  .items { width: 100%; margin: 20pt 0 12pt; }
  .items th { background: #1a1a1a; color: #fff; padding: 7pt 10pt;
              font-size: 8pt; text-transform: uppercase; font-weight: bold; }
  .items td { padding: 8pt 10pt; border-bottom: 0.5pt solid #e5e7eb; font-size: 10pt; }
  .items tr:last-child td { border-bottom: none; }

  .totals td { padding: 4pt 8pt; font-size: 10pt; }
  .totals .final td { font-weight: bold; font-size: 12pt;
                      border-top: 1.5pt solid #1a1a1a; padding-top: 7pt; }

  .notes { margin-top: 24pt; padding: 10pt 14pt; background: #f5f5f5;
           border-left: 3pt solid #ccc; font-size: 9pt; color: #444; }

  .footer { margin-top: 36pt; padding-top: 10pt; border-top: 0.5pt solid #ddd;
            font-size: 8pt; color: #aaa; text-align: center; }
</style>
</head>
<body>
<div class="page">

  <table class="header" style="width:100%">
    <tr>
      <td style="width:58%">
        <div class="biz-name">{{ $quote->photoSession->photographer->photographerProfile->business_name ?? $quote->photoSession->photographer->name }}</div>
        @if($quote->photoSession->photographer->photographerProfile->nif ?? false)
          <div class="biz-detail">NIF: {{ $quote->photoSession->photographer->photographerProfile->nif }}</div>
        @endif
        @if($quote->photoSession->photographer->photographerProfile->address ?? false)
          <div class="biz-detail">{{ $quote->photoSession->photographer->photographerProfile->address }}, {{ $quote->photoSession->photographer->photographerProfile->city }}</div>
        @endif
        <div class="biz-detail">{{ $quote->photoSession->photographer->email }}</div>
        @if($quote->photoSession->photographer->phone ?? false)
          <div class="biz-detail">{{ $quote->photoSession->photographer->phone }}</div>
        @endif
      </td>
      <td style="width:42%; text-align:right">
        <div class="doc-title">PRESUPUESTO #{{ $quote->id }}</div>
        <div style="margin-top:8pt; text-align:right">
          <span class="badge badge-{{ $quote->status->value }}">{{ strtoupper($quote->status->value) }}</span>
        </div>
        <div class="doc-meta">Fecha: {{ now()->format('d/m/Y') }}</div>
        @if($quote->valid_until)
          <div class="doc-meta">Valido hasta: {{ $quote->valid_until->format('d/m/Y') }}</div>
        @endif
      </td>
    </tr>
  </table>

  <table style="width:100%; margin-bottom:24pt">
    <tr>
      <td style="width:50%; vertical-align:top; padding-right:20pt">
        <div class="section-label">Sesion</div>
        <div class="section-name">{{ $quote->photoSession->name }}</div>
        <div class="section-detail">Fecha: {{ $quote->photoSession->date->format('d/m/Y') }}</div>
        @if($quote->photoSession->location)
          <div class="section-detail">Lugar: {{ $quote->photoSession->location }}</div>
        @endif
        @if($quote->photoSession->type)
          <div class="section-detail">Tipo: {{ ucfirst($quote->photoSession->type->value) }}</div>
        @endif
      </td>
      <td style="width:50%; vertical-align:top">
        <div class="section-label">Cliente</div>
        <div class="section-name">{{ $quote->photoSession->client->name }}</div>
        @if($quote->photoSession->client->email)
          <div class="section-detail">{{ $quote->photoSession->client->email }}</div>
        @endif
        @if($quote->photoSession->client->phone)
          <div class="section-detail">{{ $quote->photoSession->client->phone }}</div>
        @endif
        @if($quote->photoSession->client->nif)
          <div class="section-detail">NIF: {{ $quote->photoSession->client->nif }}</div>
        @endif
        @if($quote->photoSession->client->address)
          <div class="section-detail">{{ $quote->photoSession->client->address }}, {{ $quote->photoSession->client->city }}</div>
        @endif
      </td>
    </tr>
  </table>

  <table class="items">
    <thead>
      <tr>
        <th style="text-align:left; width:48%">Descripcion</th>
        <th style="text-align:center; width:14%">Cantidad</th>
        <th style="text-align:right; width:18%">Precio unit.</th>
        <th style="text-align:right; width:20%">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($quote->items as $item)
      <tr>
        <td>{{ $item->description }}</td>
        <td style="text-align:center">{{ number_format($item->quantity, 2) }}</td>
        <td style="text-align:right">{{ number_format($item->unit_price, 2) }} EUR</td>
        <td style="text-align:right">{{ number_format($item->subtotal, 2) }} EUR</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <table style="width:100%">
    <tr>
      <td style="width:58%"></td>
      <td style="width:42%; vertical-align:top">
        <table class="totals" style="width:100%">
          <tr>
            <td>Base imponible</td>
            <td style="text-align:right">{{ number_format($quote->subtotal, 2) }} EUR</td>
          </tr>
          <tr>
            <td>IVA ({{ number_format($quote->tax_rate, 0) }}%)</td>
            <td style="text-align:right">{{ number_format($quote->tax_amount, 2) }} EUR</td>
          </tr>
          <tr class="final">
            <td>TOTAL</td>
            <td style="text-align:right">{{ number_format($quote->total, 2) }} EUR</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  @if($quote->notes)
    <div class="notes"><strong>Notas:</strong> {{ $quote->notes }}</div>
  @endif

  <div class="footer">Documento generado por RAW Manager &bull; {{ now()->format('d/m/Y') }}</div>
</div>
</body>
</html>
