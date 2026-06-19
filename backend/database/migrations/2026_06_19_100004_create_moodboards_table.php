<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moodboards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photographer_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('folder')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['photographer_id']);
        });

        Schema::create('moodboard_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moodboard_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['image', 'url', 'note'])->default('image');
            $table->string('path')->nullable();
            $table->string('url')->nullable();
            $table->text('content')->nullable();
            $table->string('caption')->nullable();
            $table->smallInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moodboard_items');
        Schema::dropIfExists('moodboards');
    }
};
