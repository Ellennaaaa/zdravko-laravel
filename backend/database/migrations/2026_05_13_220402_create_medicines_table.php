<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('medicines')->insert([
            ['name' => 'Insulin', 'description' => 'Insulin therapy', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Metformin', 'description' => 'Oral diabetes medication', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};