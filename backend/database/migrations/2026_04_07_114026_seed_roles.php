<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roles = ['patient', 'contact', 'admin'];
        foreach ($roles as $role) {
            DB::table('roles')->insertOrIgnore(['name' => $role]);
        }
    }

    public function down(): void
    {
        DB::table('roles')->whereIn('name', ['patient', 'admin'])->delete();
    }
};