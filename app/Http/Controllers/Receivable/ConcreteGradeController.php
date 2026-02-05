<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use App\Models\ConcreteGrade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ConcreteGradeController extends Controller
{
    public function index()
    {
        $grades = ConcreteGrade::forCurrentOffice()->orderBy('name')->get();
        return Inertia::render('Receivable/Grades/Index', [
            'grades' => $grades
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        ConcreteGrade::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'],
            'office_id' => 1,
        ]);

        return Redirect::back()->with('message', 'Mutu beton berhasil ditambahkan.');
    }

    public function update(Request $request, ConcreteGrade $grade)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        $grade->update($validated);

        return Redirect::back()->with('message', 'Mutu berhasil diperbarui.');
    }

    public function destroy(ConcreteGrade $grade)
    {
        $grade->delete();
        return Redirect::back()->with('message', 'Mutu berhasil dihapus.');
    }
}
