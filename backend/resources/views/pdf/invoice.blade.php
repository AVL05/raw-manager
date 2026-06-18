<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
  .page { padding: 48pt; }

  .header { width: 100%; border-bottom: 2pt solid #1a1a1a; padding-bottom: 20pt; margin-bottom: 24pt; }
  .biz-name   { font-size: 18pt; font-weight: bold; color: #1a1a1a; margin-bottom: 4pt; }
  .biz-detail { font-size: 9pt; color: #555; margin-top: 3pt; }
  .doc-title  { font-size: 16pt; font-weight: bold; text-align: right; }
  .doc-meta   { font-size: 9pt; color: #555; text-align: right; margin-top: 3pt; }

  .badge { font-size: 8pt; font-weight: bold; padding: 2pt 8pt; border-radius: 2pt; }
  .badge-paid    { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-overdue { background: #fee2e2; color: #991b1b; }

  .section-label  { font-size: 8pt; font-weight: bold; text-transform: uppercase;
                    color: #888; letter-spacing: 0.5pt; margin-bottom: 5pt; }
  .section-name   { font-size: 11pt; font-weight: bold; margin-bottom: 2pt; }
  .section-detail { font-size: 9pt; color: #555; margin-top: 2pt; }

  table { border-collapse: collapse; }

  .items { width: 100%; margin: 20pt 0 12pt; }
  .items th { background: #1a1a1a; color: #fff; padding: 7pt 10pt;
              font-size: 8pt; text-transform: uppercase; font-weight: bold; }
  .items td { padding: 8pt 10pt; border-bottom: 0.5pt solid #e5e7eb; font-size: 10pt; }
  .items tr:last-child td { border-bottom: none; }

  .totals td { padding: 4pt 8pt; font-size: 10pt; }
  .totals .final td { font-weight: bold; font-size: 12pt;
                      border-top: 1.5pt solid #1a1a1a; padding-top: 7pt; }

  .stamp-box { text-align: center; margin-top: 24pt; }
  .stamp { display: inline-block; border: 3pt solid #059669; color: #059669;
           padding: 6pt 18pt; font-size: 16pt; font-weight: bold; }

  .footer { margin-top: 36pt; padding-top: 10pt; border-top: 0.5pt solid #ddd;
            font-size: 8pt; color: #aaa; text-align: center; }
</style>
</head>
<body>
<div class="page">

  <table class="header" style="width:100%">
    <tr>
      <td style="width:58%; vertical-align:top">
        <div class="biz-name">{{ $invoice->photoSession->photographer->photographerProfile->business_name ?? $invoice->photoSession->photographer->name }}</div>
        @if($invoice->photoSession->photographer->photographerProfile->nif ?? false)
          <div class="biz-detail">NIF: {{ $invoice->photoSession->photographer->photographerProfile->nif }}</div>
        @endif
        @if($invoice->photoSession->photographer->photographerProfile->address ?? false)
          <div class="biz-detail">{{ $invoice->photoSession->photographer->photographerProfile->address }}, {{ $invoice->photoSession->photographer->photographerProfile->city }}</div>
        @endif
        <div class="biz-detail">{{ $invoice->photoSession->photographer->email }}</div>
        @if($invoice->photoSession->photographer->phone ?? false)
          <div class="biz-detail">{{ $invoice->photoSession->photographer->phone }}</div>
        @endif
      </td>
      <td style="width:42%; vertical-align:top">
        <div class="doc-title">FACTURA</div>
        <div class="doc-title" style="font-size:13pt; margin-top:3pt">{{ $invoice->invoice_number }}</div>
        <div style="margin-top:8pt; text-align:right">
          <span class="badge badge-{{ $invoice->status->value }}">{{ strtoupper($invoice->status->value) }}</span>
        </div>
        <div class="doc-meta">Emision: {{ $invoice->issue_date->format('d/m/Y') }}</div>
        @if($invoice->due_date)
          <div class="doc-meta">Vencimiento: {{ $invoice->due_date->format('d/m/Y') }}</div>
        @endif
        @if($invoice->payment_date)
          <div class="doc-meta">Pagada el: {{ $invoice->payment_date->format('d/m/Y') }}</div>
        @endif
      </td>
    </tr>
  </table>

  <table style="width:100%; margin-bottom:24pt">
    <tr>
      <td style="width:50%; vertical-align:top; padding-right:20pt">
        <div class="section-label">Fotografo</div>
        <div class="section-name">{{ $invoice->photoSession->photographer->photographerProfile->business_name ?? $invoice->photoSession->photographer->name }}</div>
        <div class="section-detail">{{ $invoice->photoSession->photographer->email }}</div>
        @if($invoice->photoSession->photographer->photographerProfile->nif ?? false)
          <div class="section-detail">NIF: {{ $invoice->photoSession->photographer->photographerProfile->nif }}</div>
        @endif
        @if($invoice->photoSession->photographer->photographerProfile->address ?? false)
          <div class="section-detail">{{ $invoice->photoSession->photographer->photographerProfile->address }}, {{ $invoice->photoSession->photographer->photographerProfile->city }}</div>
        @endif
      </td>
      <td style="width:50%; vertical-align:top">
        <div class="section-label">Cliente</div>
        <div class="section-name">{{ $invoice->photoSession->client->name }}</div>
        @if($invoice->photoSession->client->email)
          <div class="section-detail">{{ $invoice->photoSession->client->email }}</div>
        @endif
        @if($invoice->photoSession->client->nif)
          <div class="section-detail">NIF: {{ $invoice->photoSession->client->nif }}</div>
        @endif
        @if($invoice->photoSession->client->phone)
          <div class="section-detail">{{ $invoice->photoSession->client->phone }}</div>
        @endif
        @if($invoice->photoSession->client->address)
          <div class="section-detail">{{ $invoice->photoSession->client->address }}, {{ $invoice->photoSession->client->city }}</div>
        @endif
      </td>
    </tr>
  </table>

  <table class="items">
    <thead>
      <tr>
        <th style="text-align:left; width:70%">Concepto</th>
        <th style="text-align:right; width:30%">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ $invoice->photoSession->name }} - Servicios fotograficos</td>
        <td style="text-align:right">{{ number_format($invoice->subtotal, 2) }} EUR</td>
      </tr>
      @if($invoice->quote)
        @foreach($invoice->quote->items as $item)
        <tr>
          <td style="font-size:9pt; color:#666; padding-left:16pt">{{ $item->description }}</td>
          <td style="text-align:right; font-size:9pt; color:#666">{{ number_format($item->subtotal, 2) }} EUR</td>
        </tr>
        @endforeach
      @endif
    </tbody>
  </table>

  <table style="width:100%">
    <tr>
      <td style="width:58%"></td>
      <td style="width:42%; vertical-align:top">
        <table class="totals" style="width:100%">
          <tr>
            <td>Base imponible</td>
            <td style="text-align:right">{{ number_format($invoice->subtotal, 2) }} EUR</td>
          </tr>
          <tr>
            <td>IVA ({{ number_format($invoice->tax_rate, 0) }}%)</td>
            <td style="text-align:right">{{ number_format($invoice->tax_amount, 2) }} EUR</td>
          </tr>
          <tr class="final">
            <td>TOTAL</td>
            <td style="text-align:right">{{ number_format($invoice->total, 2) }} EUR</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  @if($invoice->status->value === 'paid')
    <div class="stamp-box">
      <span class="stamp">PAGADA</span>
    </div>
  @endif

  @if($invoice->notes)
    <div style="margin-top:20pt; padding:10pt 14pt; background:#f5f5f5; border-left:3pt solid #ccc; font-size:9pt; color:#444">
      <strong>Notas:</strong> {{ $invoice->notes }}
    </div>
  @endif

  <div class="footer">Documento generado por RAW Manager &bull; {{ now()->format('d/m/Y') }}</div>
</div>
</body>
</html>
