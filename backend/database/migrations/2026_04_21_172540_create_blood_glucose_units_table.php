<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_glucose_units', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('symbol', 20);
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('blood_glucose_units')->insert([
            ['name' => 'Milligrams per deciliter', 'symbol' => 'mg/dL', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Millimoles per liter', 'symbol' => 'mmol/L', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_glucose_units');
    }
};