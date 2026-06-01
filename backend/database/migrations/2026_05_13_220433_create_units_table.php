<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('symbol', 20);
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('units')->insert([
            ['name' => 'Milligram', 'symbol' => 'mg', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Milliliter', 'symbol' => 'ml', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tablet', 'symbol' => 'tablet', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'International Unit', 'symbol' => 'IU', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};