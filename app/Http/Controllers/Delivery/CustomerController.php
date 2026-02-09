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
    public function index()
    {
        $officeId = $this->officeService->getCurrentOfficeId();
        $customers = Customer::where('office_id', $officeId)
            ->latest()
            ->get();

        return Inertia::render('Delivery/Customer/Index', [
            'customers' => $customers
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
                Rule::unique('customers')->where(function ($query) use ($officeId) {
                    return $query->where('office_id', $officeId);
                })
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
    public function show(Customer $customer)
    {
        return Inertia::render('Delivery/Customer/Show', [
            'customer' => $customer->load('deliveryProjects')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('customers')->where(function ($query) use ($officeId) {
                    return $query->where('office_id', $officeId);
                })->ignore($customer->id)
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
