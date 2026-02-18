<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\Customer;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
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
        $customers = Customer::when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhere('contact', 'like', "%{$search}%");
        })
            ->latest()
            ->get();

        return Inertia::render('Delivery/Customer/Index', [
            'customers' => $customers,
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('customers'), // Global uniqueness
            ],
            'address' => 'nullable|string',
            'contact' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:255',
        ], [
            'name.unique' => 'Nama Customer sudah ada.',
        ]);

        $validated['office_id'] = $officeId;

        Customer::create($validated);

        return redirect()->back()->with('message', 'Customer Berhasil Ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer)
    {
        $search = $request->input('search');

        $customer->load(['deliveryProjects' => function ($query) use ($search) {
            $query->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('work_type', 'like', "%{$search}%");
            });
        }]);

        return Inertia::render('Delivery/Customer/Show', [
            'customer' => $customer,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        // $officeId = $this->officeService->getCurrentOfficeId(); // Not needed for validation anymore

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('customers')->ignore($customer->id), // Global uniqueness
            ],
            'address' => 'nullable|string',
            'contact' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:255',
        ], [
            'name.unique' => 'Nama Customer sudah ada.',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('message', 'Customer Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->back()->with('message', 'Customer Berhasil Dihapus');
    }
}
