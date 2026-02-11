<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use App\Models\Delivery\Customer;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\DeliveryShipment;
use App\Models\ReceivableTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceivableController extends Controller
{
    public function dashboard()
    {
        $totalReceivable = Customer::get()->sum('total_receivable');
        $totalPaidMonth = ReceivableTransaction::where('type', 'payment')
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        $receivableByCustomer = Customer::withCount('projects')
            ->get()
            ->sortByDesc('total_receivable')
            ->take(5)
            ->values();

        return Inertia::render('Receivable/Dashboard', [
            'stats' => [
                'total_receivable' => $totalReceivable,
                'total_paid_month' => $totalPaidMonth,
                'customer_count' => Customer::count(),
                'project_count' => DeliveryProject::count(),
            ],
            'top_customers' => $receivableByCustomer
        ]);
    }

    public function index()
    {
        $customers = Customer::withCount('projects')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'projects_count' => $customer->projects_count,
                    'total_receivable' => $customer->total_receivable,
                ];
            });

        return Inertia::render('Receivable/Index', [
            'customers' => $customers
        ]);
    }

    public function showCustomer(Customer $customer)
    {
        $projects = $customer->projects()
            ->get()
            ->map(function ($project) {
                $totalBill = $project->shipments->sum('total_price_with_tax');
                $totalPaid = $project->payments->sum('amount');

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'location' => $project->location,
                    'total_bill' => $totalBill,
                    'total_paid' => $totalPaid,
                    'remaining' => $totalBill - $totalPaid,
                ];
            });

        return Inertia::render('Receivable/CustomerDetail', [
            'customer' => $customer,
            'projects' => $projects
        ]);
    }

    public function showProject(DeliveryProject $project)
    {
        $project->load(['customer', 'shipments.concreteGrade', 'payments']);

        return Inertia::render('Receivable/ProjectDetail', [
            'project' => $project,
            'unbilled_shipments' => $project->shipments()->where('is_billed', false)->with('concreteGrade')->get(),
            'billed_shipments' => $project->shipments()->where('is_billed', true)->with('concreteGrade')->get(),
            'payments' => $project->payments()->orderBy('date', 'desc')->get(),
        ]);
    }

    public function payments()
    {
        $payments = ReceivableTransaction::with(['customer', 'deliveryProject'])
            ->where('type', 'payment')
            ->orderBy('date', 'desc')
            ->paginate(15);

        return Inertia::render('Receivable/Payments', [
            'payments' => $payments
        ]);
    }

    public function storePayment(Request $request, DeliveryProject $project)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $project->payments()->create([
            'customer_id' => $project->customer_id,
            'type' => 'payment',
            'amount' => $request->amount,
            'date' => $request->date,
            'description' => $request->description,
            'notes' => $request->notes,
            'office_id' => $request->user()->office_id ?? 1,
        ]);

        return redirect()->back()->with('success', 'Pembayaran berhasil disimpan.');
    }

    public function exportInvoice(Request $request, DeliveryProject $project)
    {
        // 1. Ambil data Pengiriman (Items Invoice)
        $query = $project->shipments()->with('concreteGrade');

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $shipments = $query->get();

        // 2. Ambil data Pembayaran (DP)
        // Menjumlahkan semua pembayaran yang masuk SEBELUM atau PADA tanggal invoice ini
        $paymentQuery = $project->payments();
        if ($request->end_date) {
            $paymentQuery->where('date', '<=', $request->end_date);
        }
        $totalDP = $paymentQuery->sum('amount');

        // 3. Kalkulasi
        $subtotal = $shipments->sum('total_price');

        $ppn = $subtotal * 0.11; // PPN 11%
        $grandTotal = ($subtotal + $ppn) - $totalDP;

        // Helper Terbilang (ubah angka jadi teks)
        $terbilang = $this->terbilang($grandTotal) . ' Rupiah';

        // 4. Generate PDF
        $pdf = PDF::loadView('pdf.invoice.jkk_invoice', [
            'project' => $project,
            'customer' => $project->customer,
            'shipments' => $shipments,
            'subtotal' => $subtotal,
            'ppn' => $ppn,
            'dp' => $totalDP,
            'grandTotal' => $grandTotal,
            'terbilang' => $terbilang,
            'invoiceDate' => $request->invoice_date ?? now(),
            'doc_no' => $request->doc_no,
            'delivery_note' => $request->delivery_note,
            'po_so_no' => $request->po_so_no,
            'terms_of_payment' => $request->terms_of_payment,
            'due_date_jt' => $request->due_date_jt,
        ]);

        // Mark shipments as billed
        if ($request->mark_as_billed) {
            $shipments->each->update(['is_billed' => true]);
        }

        return $pdf->stream('Invoice-' . $project->name . '-' . now()->format('Ymd') . '.pdf');
    }

    /**
     * Helper function to convert number to Indonesian words
     */
    private function terbilang($number)
    {
        $number = abs($number);
        $words = array("", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas");
        $temp = "";

        if ($number < 12) {
            $temp = " " . $words[$number];
        } else if ($number < 20) {
            $temp = $this->terbilang($number - 10) . " Belas";
        } else if ($number < 100) {
            $temp = $this->terbilang($number / 10) . " Puluh" . $this->terbilang($number % 10);
        } else if ($number < 200) {
            $temp = " Seratus" . $this->terbilang($number - 100);
        } else if ($number < 1000) {
            $temp = $this->terbilang($number / 100) . " Ratus" . $this->terbilang($number % 100);
        } else if ($number < 2000) {
            $temp = " Seribu" . $this->terbilang($number - 1000);
        } else if ($number < 1000000) {
            $temp = $this->terbilang($number / 1000) . " Ribu" . $this->terbilang($number % 1000);
        } else if ($number < 1000000000) {
            $temp = $this->terbilang($number / 1000000) . " Juta" . $this->terbilang($number % 1000000);
        } else if ($number < 1000000000000) {
            $temp = $this->terbilang($number / 1000000000) . " Milyar" . $this->terbilang(fmod($number, 1000000000));
        } else if ($number < 1000000000000000) {
            $temp = $this->terbilang($number / 1000000000000) . " Trilyun" . $this->terbilang(fmod($number, 1000000000000));
        }

        return trim($temp);
    }
}
