<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\ConcreteGrade;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ConcreteGradeController extends Controller
{
    protected $officeService;

    public function __construct(OfficeContextService $officeService)
    {
        $this->officeService = $officeService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Don't filter by office. Data is shared.
        $concreteGrades = ConcreteGrade::when($search, function ($query, $search) {
            $query->where('code', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        })
            ->latest()
            ->get();

        return Inertia::render('Delivery/ConcreteGrade/Index', [
            'concreteGrades' => $concreteGrades,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('concrete_grades')
            ],
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'code.unique' => 'Kode Mutu sudah ada.',
        ]);

        $validated['office_id'] = $officeId;

        ConcreteGrade::create($validated);

        return redirect()->back()->with('message', 'Mutu Beton Berhasil Ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ConcreteGrade $concreteGrade)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('concrete_grades')->ignore($concreteGrade->id)
            ],
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'code.unique' => 'Kode Mutu sudah ada.',
        ]);

        $concreteGrade->update($validated);

        return redirect()->back()->with('message', 'Mutu Beton Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ConcreteGrade $concreteGrade)
    {
        $concreteGrade->delete();
        return redirect()->back()->with('message', 'Mutu Beton Berhasil Dihapus');
    }
}
