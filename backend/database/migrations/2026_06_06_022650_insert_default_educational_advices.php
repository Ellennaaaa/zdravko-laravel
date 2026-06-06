<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('educational_advices')->insert([
            [
                'diabetes_type_id' => null,
                'min_age' => 0,
                'max_age' => 18,
                'title' => 'Redovno mjerenje',
                'content' => 'Redovno mjerenje glukoze pomaže da bolje razumiješ kako hrana i fizička aktivnost utiču na tvoje zdravlje.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'diabetes_type_id' => null,
                'min_age' => 19,
                'max_age' => 64,
                'title' => 'Kontrola glukoze',
                'content' => 'Dosljedno praćenje glukoze i terapije može pomoći u sprečavanju komplikacija.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'diabetes_type_id' => null,
                'min_age' => 65,
                'max_age' => null,
                'title' => 'Praćenje simptoma',
                'content' => 'Ako primijetite učestale promjene vrijednosti glukoze ili nove simptome, konsultujte ljekara.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'diabetes_type_id' => 1,
                'min_age' => null,
                'max_age' => null,
                'title' => 'Dijabetes tip 1',
                'content' => 'Kod dijabetesa tipa 1 posebno je važno pratiti vrijednosti prije i poslije obroka.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'diabetes_type_id' => 2,
                'min_age' => null,
                'max_age' => null,
                'title' => 'Dijabetes tip 2',
                'content' => 'Redovna fizička aktivnost i pravilna ishrana mogu pomoći u kontroli dijabetesa tipa 2.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('educational_advices')->whereIn('title', [
            'Redovno mjerenje',
            'Kontrola glukoze',
            'Praćenje simptoma',
            'Dijabetes tip 1',
            'Dijabetes tip 2',
        ])->delete();
    }
};