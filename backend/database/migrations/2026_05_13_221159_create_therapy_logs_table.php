<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('therapy_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();

            $table->foreignId('therapy_id')
                ->nullable()
                ->constrained('therapies')
                ->nullOnDelete();

            $table->foreignId('medicine_id')
                ->constrained('medicines')
                ->cascadeOnDelete();

            $table->decimal('dosage', 6, 2);

            $table->foreignId('unit_id')
                ->constrained('units')
                ->cascadeOnDelete();

            $table->dateTime('taken_at');
            $table->text('note')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('patient_id');
            $table->index('therapy_id');
            $table->index('medicine_id');
            $table->index('unit_id');
            $table->index('taken_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('therapy_logs');
    }
};