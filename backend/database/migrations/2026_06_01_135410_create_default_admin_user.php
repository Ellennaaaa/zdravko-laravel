<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $adminId = DB::table('users')->insertGetId([
            'username' => 'admin',
            'email' => 'zdravkoo.app@gmail.com',
            'password' => Hash::make('Admin123!'),
            'phone_number' => '000000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $adminRole = DB::table('roles')
            ->where('name', 'admin')
            ->first();

        if ($adminRole) {
            DB::table('role_users')->insert([
                'user_id' => $adminId,
                'role_id' => $adminRole->id,
            ]);
        }
    }

    public function down(): void
    {
        $user = DB::table('users')
            ->where('email', 'zdravkoo.app@gmail.com')
            ->first();

        if ($user) {

            DB::table('role_users')
                ->where('user_id', $user->id)
                ->delete();

            DB::table('users')
                ->where('id', $user->id)
                ->delete();
        }
    }
};