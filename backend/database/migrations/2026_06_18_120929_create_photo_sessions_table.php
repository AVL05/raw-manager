<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photographer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('name');
            $table->date('date');
            $table->time('time')->nullable();
            $table->string('location')->nullable();
            $table->enum('type', ['wedding', 'portrait', 'product', 'event', 'car', 'landscape', 'other'])->default('portrait');
            $table->enum('status', ['pending', 'confirmed', 'done', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('price', 10, 2)->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_sessions');
    }
};