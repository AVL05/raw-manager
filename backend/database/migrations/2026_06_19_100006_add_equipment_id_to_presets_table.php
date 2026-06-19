<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->foreignId('equipment_id')
                  ->nullable()
                  ->after('photographer_id')
                  ->constrained('equipment')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Equipment::class);
            $table->dropColumn('equipment_id');
        });
    }
};
