<?php

namespace App\Enums;

enum SessionType: string
{
    case Wedding = 'wedding';
    case Portrait = 'portrait';
    case Product = 'product';
    case Event = 'event';
    case Car = 'car';
    case Landscape = 'landscape';
    case Other = 'other';

    public function label(): string
    {
        return match($this) {
            self::Wedding => 'Boda',
            self::Portrait => 'Retrato',
            self::Product => 'Producto',
            self::Event => 'Evento',
            self::Car => 'Coche',
            self::Landscape => 'Paisaje',
            self::Other => 'Otro',
        };
    }
}