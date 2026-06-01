<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $types = ['Type 1', 'Type 2', 'Gestational'];
        foreach ($types as $type) {
            DB::table('diabetes_types')->insertOrIgnore(['name' => $type]);
        }
    }

    public function down(): void
    {
        DB::table('diabetes_types')->whereIn('name', ['Type 1', 'Type 2', 'Gestational'])->delete();
    }
};