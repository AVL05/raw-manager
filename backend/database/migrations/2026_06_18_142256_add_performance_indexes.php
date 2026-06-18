<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->index('photographer_id');
            $table->index('name');
        });

        Schema::table('photo_sessions', function (Blueprint $table) {
            $table->index('photographer_id');
            $table->index('status');
            $table->index('date');
            $table->index(['photographer_id', 'status']);
            $table->index(['photographer_id', 'date']);
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->index('photo_session_id');
            $table->index('status');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('photo_session_id');
            $table->index('status');
            $table->index(['photo_session_id', 'status']);
        });

        Schema::table('galleries', function (Blueprint $table) {
            $table->index('photo_session_id');
            $table->index('is_active');
        });

        Schema::table('gallery_images', function (Blueprint $table) {
            $table->index('gallery_id');
            $table->index(['gallery_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['photographer_id']);
            $table->dropIndex(['name']);
        });
        Schema::table('photo_sessions', function (Blueprint $table) {
            $table->dropIndex(['photographer_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['date']);
            $table->dropIndex(['photographer_id', 'status']);
            $table->dropIndex(['photographer_id', 'date']);
        });
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropIndex(['photo_session_id']);
            $table->dropIndex(['status']);
        });
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['photo_session_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['photo_session_id', 'status']);
        });
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropIndex(['photo_session_id']);
            $table->dropIndex(['is_active']);
        });
        Schema::table('gallery_images', function (Blueprint $table) {
            $table->dropIndex(['gallery_id']);
            $table->dropIndex(['gallery_id', 'order']);
        });
    }
};
