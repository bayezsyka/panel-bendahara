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
    public function exportPdf()
    {
        // Get all customers with their projects, shipments, and payments
        $customers = Customer::with(['projects.shipments.concreteGrade', 'projects.payments'])
            ->whereHas('projects', function ($q) {
                // Ensure customer has projects causing some activity
                $q->has('shipments')->orHas('payments');
            })
            ->get();

        $reports = $customers->map(function ($customer) {
            $ledger = collect();

            foreach ($customer->projects as $project) {
                // Map Shipments
                $shipments = $project->shipments->map(function ($shipment) use ($project) {
                    return [
                        'type' => 'shipment',
                        'date' => $shipment->date,
                        'original_date' => $shipment->date,
                        'project_name' => $project->name,
                        'docket_number' => $shipment->docket_number,
                        'concrete_grade' => $shipment->concreteGrade ? $shipment->concreteGrade->code : '-',
                        'volume' => (float) $shipment->volume,
                        'price_per_m3' => (float) $shipment->price_per_m3,
                        'debit' => (float) $shipment->total_price_with_tax,
                        'credit' => 0,
                        'description' => $shipment->notes,
                    ];
                });
                $ledger = $ledger->concat($shipments);

                // Map Payments
                $payments = $project->payments->map(function ($payment) use ($project) {
                    return [
                        'type' => 'payment',
                        'date' => $payment->date,
                        'original_date' => $payment->date,
                        'project_name' => $project->name,
                        'docket_number' => '-',
                        'concrete_grade' => '-',
                        'volume' => 0,
                        'price_per_m3' => 0,
                        'debit' => 0,
                        'credit' => (float) $payment->amount,
                        'description' => $payment->description,
                    ];
                });
                $ledger = $ledger->concat($payments);
            }

            // Sort by Date
            $ledger = $ledger->sortBy(function ($item) {
                $date = $item['original_date'];
                if (!$date instanceof \Carbon\Carbon) {
                    $date = \Carbon\Carbon::parse($date);
                }
                return $date->format('Ymd') . ($item['type'] === 'shipment' ? '0' : '1');
            });

            // Calculate Running Totals
            $runningBalance = 0;
            $totalVolume = 0;
            $totalTagihan = 0;
            $totalPayment = 0;

            $ledger = $ledger->map(function ($item) use (&$runningBalance, &$totalVolume, &$totalTagihan, &$totalPayment) {
                $runningBalance += $item['debit'] - $item['credit'];

                if ($item['type'] === 'shipment') {
                    $totalVolume += $item['volume'];
                    $totalTagihan += $item['debit'];
                    $item['running_volume'] = $totalVolume;
                    $item['running_tagihan'] = $totalTagihan;
                } else {
                    $totalPayment += $item['credit'];
                    $item['running_volume'] = $totalVolume; // Keep last known volume? Or Dash? Request shows dash.
                    $item['running_tagihan'] = $totalTagihan; // Keep last known tagihan? Or Dash?
                }

                $item['balance'] = $runningBalance;

                return $item;
            });

            // Only return if there is data
            if ($ledger->isEmpty()) {
                return null;
            }

            return [
                'customer_name' => $customer->name,
                'ledger' => $ledger,
                'summary' => [
                    'total_volume' => $totalVolume,
                    'total_tagihan' => $totalTagihan,
                    'total_payment' => $totalPayment,
                    'final_balance' => $runningBalance
                ]
            ];
        })->filter();

        // Check if there are any reports
        if ($reports->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada data piutang untuk diekspor.');
        }

        $pdf = Pdf::loadView('pdf.receivable.recap', [
            'reports' => $reports,
            'period' => 'Semua Periode',
            'date_printed' => now()->format('d-M-Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Laporan_Piutang_Gabungan.pdf');
    }

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
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'slug' => $customer->slug,
                    'name' => $customer->name,
                    'projects_count' => $customer->projects_count,
                    'total_receivable' => (float) $customer->total_receivable,
                ];
            })
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
                    'slug' => $customer->slug,
                    'name' => $customer->name,
                    'address' => $customer->address,
                    'contact' => $customer->contact,
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
                    'slug' => $project->slug,
                    'name' => $project->name,
                    'location' => $project->location,
                    'total_bill' => $totalBill,
                    'total_bill_dpp' => $project->shipments->sum('total_price'),
                    'has_ppn' => $project->has_ppn,
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

        $ledger = $project->shipments->map(function ($shipment) {
            return [
                'id' => 's-' . $shipment->id,
                'type' => 'shipment',
                'date' => $shipment->date,
                'original_date' => $shipment->date, // For sorting
                'docket_number' => $shipment->docket_number,
                'concrete_grade' => $shipment->concreteGrade,
                'volume' => (float) $shipment->volume,
                'price_per_m3' => (float) $shipment->price_per_m3,
                'debit' => (float) $shipment->total_price_with_tax,
                'credit' => 0,
                'description' => 'Pengiriman',
                'notes' => $shipment->docket_number,
                'created_at' => $shipment->created_at,
            ];
        })->concat($project->payments->map(function ($payment) {
            return [
                'id' => 'p-' . $payment->id,
                'type' => 'payment',
                'date' => $payment->date,
                'original_date' => $payment->date, // For sorting
                'docket_number' => '-',
                'concrete_grade' => null,
                'volume' => 0,
                'price_per_m3' => 0,
                'debit' => 0,
                'credit' => (float) $payment->amount,
                'description' => $payment->description,
                'notes' => $payment->notes,
                'created_at' => $payment->created_at,
            ];
        }))->sortBy(function ($item) {
            $date = $item['original_date'];
            if (!$date instanceof \Carbon\Carbon) {
                $date = \Carbon\Carbon::parse($date);
            }
            return $date->format('Ymd') . ($item['type'] === 'shipment' ? '0' : '1'); // Shipments first on same day
        });

        // Calculate running totals
        $runningBalance = 0;
        $runningVolume = 0;
        $runningTagihan = 0;

        $ledger = $ledger->map(function ($item) use (&$runningBalance, &$runningVolume, &$runningTagihan) {
            $runningBalance += $item['debit'] - $item['credit'];
            $runningVolume += $item['volume'];
            $runningTagihan += $item['debit'];

            $item['balance'] = $runningBalance;
            $item['total_volume'] = $runningVolume;
            $item['total_tagihan'] = $runningTagihan;
            return $item;
        });

        return Inertia::render('Receivable/ProjectDetail', [
            'project' => $project,
            'unbilled_shipments' => $project->shipments()->where('is_billed', false)->with('concreteGrade')->get(),
            'billed_shipments' => $project->shipments()->where('is_billed', true)->with('concreteGrade')->get(),
            'payments' => $project->payments()->orderBy('date', 'desc')->get(),
            'ledger' => $ledger->values(),
            'concrete_grades' => \App\Models\Delivery\ConcreteGrade::all(['id', 'code', 'price']),
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

        // Check project settings for PPN
        $ppn = $project->has_ppn ? ($subtotal * 0.11) : 0; // PPN 11%
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

    public function storeLegacy(Request $request, DeliveryProject $project)
    {
        $request->validate([
            'date' => 'required|date',
            'concrete_grade_id' => 'required|exists:concrete_grades,id',
            'volume' => 'required|numeric|min:0',
            'price_per_m3' => 'required|numeric|min:0',
        ]);

        $project->shipments()->create([
            'date' => $request->date,
            'concrete_grade_id' => $request->concrete_grade_id,
            'volume' => $request->volume,
            'price_per_m3' => $request->price_per_m3,
            'is_billed' => true, // Legacy data is considered billed/invoiced
            'docket_number' => null, // Optional for legacy
            'driver_name' => 'MIGRASI',
            'vehicle_number' => 'MIGRASI',
        ]);

        return redirect()->back()->with('success', 'Data piutang berhasil ditambahkan.');
    }
}
