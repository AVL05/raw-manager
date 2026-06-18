<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_image_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_image_id')->constrained('gallery_images')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['gallery_image_id', 'client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_image_favorites');
    }
};