<?php

namespace App\Enums;

enum SessionStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Done = 'done';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending => 'Pendiente',
            self::Confirmed => 'Confirmada',
            self::Done => 'Realizada',
            self::Delivered => 'Entregada',
            self::Cancelled => 'Cancelada',
        };
    }
}