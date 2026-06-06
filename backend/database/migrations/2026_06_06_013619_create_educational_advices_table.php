<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educational_advices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('diabetes_type_id')
                ->nullable()
                ->constrained('diabetes_types')
                ->nullOnDelete();

            $table->integer('min_age')->nullable();
            $table->integer('max_age')->nullable();

            $table->string('title', 150);
            $table->text('content');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_advices');
    }
};