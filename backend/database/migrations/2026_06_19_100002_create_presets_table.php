<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photographer_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('iso')->nullable();
            $table->string('aperture')->nullable();
            $table->string('shutter_speed')->nullable();
            $table->string('white_balance')->nullable();
            $table->integer('exposure_compensation')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['photographer_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presets');
    }
};
