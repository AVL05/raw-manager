<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photographer_id')->constrained('users')->cascadeOnDelete();
            $table->string('filename');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            $table->bigInteger('size')->nullable();
            $table->string('mime_type')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['photographer_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_library');
    }
};
