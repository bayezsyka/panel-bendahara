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
        $customers = Customer::with(['projects.shipments.concreteGrade', 'projects.payments', 'projects.pumpRentals'])
            ->whereHas('projects', function ($q) {
                // Ensure customer has projects causing some activity
                $q->has('shipments')->orHas('payments')->orHas('pumpRentals');
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

                // Map Pump Rentals
                $pumpRentals = $project->pumpRentals->map(function ($rental) use ($project) {
                    $tax = $project->has_ppn ? ($rental->total_price * 0.11) : 0;
                    return [
                        'type' => 'pump_rental',
                        'date' => $rental->date,
                        'original_date' => $rental->date,
                        'project_name' => $project->name,
                        'docket_number' => $rental->docket_number ?? '-',
                        'concrete_grade' => 'Sewa Pompa',
                        'volume' => 0,
                        'price_per_m3' => 0,
                        'debit' => (float) ($rental->total_price),
                        'credit' => 0,
                        'description' => $rental->vehicle_number ? "Pompa: " . $rental->vehicle_number : "Sewa Pompa",
                    ];
                });
                $ledger = $ledger->concat($pumpRentals);

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
                return $date->format('Ymd') . ($item['type'] === 'shipment' ? '0' : ($item['type'] === 'pump_rental' ? '1' : '2'));
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
                } else if ($item['type'] === 'pump_rental') {
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
                $totalBill = $project->getRemainingBalanceAttribute(); // Use the attribute logic for accurate total? No, this is total bill + pump etc.
                // Wait, getRemainingBalanceAttribute calculates everything. But here we want breakdown.
                // The original code was:
                $totalBill = $project->shipments->sum('total_price_with_tax');
                $totalPump = $project->pumpRentals->sum('total_price');

                $totalBillAll = $totalBill + $totalPump;

                $totalPaid = $project->payments->sum('amount');

                return [
                    'id' => $project->id,
                    'slug' => $project->slug,
                    'name' => $project->name,
                    'location' => $project->location,
                    'total_bill' => $totalBillAll,
                    'total_bill_dpp' => $project->shipments->sum('total_price') + $project->pumpRentals->sum('total_price'),
                    'has_ppn' => $project->has_ppn,
                    'total_paid' => $totalPaid,
                    'remaining' => $totalBillAll - $totalPaid,
                ];
            });

        return Inertia::render('Receivable/CustomerDetail', [
            'customer' => $customer,
            'projects' => $projects
        ]);
    }

    public function showProject(DeliveryProject $project)
    {
        $project->load(['customer', 'shipments.concreteGrade', 'payments', 'pumpRentals']);

        // Calculate shipment ledger (Shipments + Payments)
        $shipRunningBalance = 0;
        $shipRunningVolume = 0;
        $shipRunningTagihan = 0;

        $shipItems = $project->shipments->map(function ($shipment) {
            return [
                'id' => 's-' . $shipment->id,
                'type' => 'shipment',
                'date' => $shipment->date,
                'original_date' => $shipment->date,
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
        });

        $payItems = $project->payments->map(function ($payment) {
            return [
                'id' => 'p-' . $payment->id,
                'type' => 'payment',
                'date' => $payment->date,
                'original_date' => $payment->date,
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
        });

        $shipmentLedger = $shipItems->concat($payItems)->sortBy(function ($item) {
            $date = $item['original_date'];
            if (!$date instanceof \Carbon\Carbon) {
                $date = \Carbon\Carbon::parse($date);
            }
            return $date->format('Ymd') . ($item['type'] === 'shipment' ? '0' : '1');
        })->values()->map(function ($item) use (&$shipRunningBalance, &$shipRunningVolume, &$shipRunningTagihan) {
            $shipRunningBalance += $item['debit'] - $item['credit'];
            if ($item['type'] === 'shipment') {
                $shipRunningVolume += $item['volume'];
            }
            $shipRunningTagihan += $item['debit'];
            $item['balance'] = $shipRunningBalance;
            $item['total_volume'] = $shipRunningVolume;
            $item['total_tagihan'] = $shipRunningTagihan;
            return $item;
        });

        // Calculate pump ledger (Charges only)
        $pumpRunningTagihan = 0;
        $pumpLedger = $project->pumpRentals->sortBy('date')->values()->map(function ($rental) use (&$pumpRunningTagihan) {
            $pumpRunningTagihan += (float) $rental->total_price;
            return [
                'id' => 'pr-' . $rental->id,
                'type' => 'pump_rental',
                'date' => $rental->date,
                'docket_number' => $rental->docket_number ?? '-',
                'vehicle_number' => $rental->vehicle_number,
                'driver_name' => $rental->driver_name,
                'volume_pumped' => $rental->volume_pumped,
                'debit' => (float) $rental->total_price,
                'total_tagihan' => $pumpRunningTagihan,
                'notes' => $rental->notes,
            ];
        });

        return Inertia::render('Receivable/ProjectDetail', [
            'project' => $project,
            'unbilled_shipments' => $project->shipments()->where('is_billed', false)->with('concreteGrade')->get(),
            'billed_shipments' => $project->shipments()->where('is_billed', true)->with('concreteGrade')->get(),
            'pump_rentals' => $project->pumpRentals,
            'payments' => $project->payments()->orderBy('date', 'desc')->get(),
            'shipment_ledger' => $shipmentLedger,
            'pump_ledger' => $pumpLedger,
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
        // 1. Ambil Items Invoice
        // Shipments
        $shipmentQuery = $project->shipments()->with('concreteGrade');
        if ($request->start_date && $request->end_date) {
            $shipmentQuery->whereBetween('date', [$request->start_date, $request->end_date]);
        }
        $shipments = $shipmentQuery->get();

        // Pump Rentals
        $includePump = $request->boolean('include_pump', true);
        $pumpRentals = collect();
        if ($includePump) {
            $pumpQuery = $project->pumpRentals();
            if ($request->start_date && $request->end_date) {
                $pumpQuery->whereBetween('date', [$request->start_date, $request->end_date]);
            }
            $pumpRentals = $pumpQuery->get();
        }

        // 2. Build Invoice Items
        $invoiceItems = collect();
        $totalVolume = 0;
        $subtotal = 0;

        // Process Shipments
        foreach ($shipments as $shipment) {
            $invoiceItems->push([
                'type' => 'shipment',
                'date' => $shipment->date,
                'description' => "Readymix " . ($shipment->concreteGrade->code ?? 'Concrete') . ", pengiriman " . date('d/m/Y', strtotime($shipment->date)),
                'docket_number' => $shipment->docket_number,
                'volume' => $shipment->volume,
                'unit' => 'M3',
                'unit_price' => $shipment->price_per_m3,
                'total_price' => $shipment->total_price,
                'is_sub_item' => false,
                'sort_key' => date('Ymd', strtotime($shipment->date)) . '_S_' . $shipment->id,
            ]);
            $totalVolume += $shipment->volume;
            $subtotal += $shipment->total_price;
        }

        // Process Pump Rentals
        foreach ($pumpRentals as $rental) {
            // Main Rental Item
            $invoiceItems->push([
                'type' => 'pump_rental',
                'date' => $rental->date,
                'description' => "Sewa Concrete Pump (Tgl: " . date('d/m/Y', strtotime($rental->date)) . ")",
                'docket_number' => $rental->docket_number,
                'volume' => 1,
                'unit' => 'Set',
                'unit_price' => $rental->rental_price,
                'total_price' => $rental->rental_price,
                'is_sub_item' => false,
                'sort_key' => date('Ymd', strtotime($rental->date)) . '_P_' . $rental->id . '_0',
            ]);
            $subtotal += $rental->rental_price;

            // Over Volume
            if ($rental->volume_pumped > $rental->limit_volume) {
                $overVol = $rental->volume_pumped - $rental->limit_volume;
                $cost = $overVol * $rental->over_volume_price;
                $invoiceItems->push([
                    'type' => 'pump_over_volume',
                    'date' => $rental->date,
                    'description' => "Over Volume ({$rental->volume_pumped} - {$rental->limit_volume})",
                    'docket_number' => '',
                    'volume' => $overVol,
                    'unit' => 'M3',
                    'unit_price' => $rental->over_volume_price,
                    'total_price' => $cost,
                    'is_sub_item' => true,
                    'sort_key' => date('Ymd', strtotime($rental->date)) . '_P_' . $rental->id . '_1',
                ]);
                $subtotal += $cost;
            }

            // Over Pipe
            if ($rental->pipes_used > $rental->limit_pipe) {
                $overPipe = $rental->pipes_used - $rental->limit_pipe;
                $cost = $overPipe * $rental->over_pipe_price;
                $invoiceItems->push([
                    'type' => 'pump_over_pipe',
                    'date' => $rental->date,
                    'description' => "Penambahan Pipa ({$rental->pipes_used} - {$rental->limit_pipe})",
                    'docket_number' => '',
                    'volume' => $overPipe,
                    'unit' => 'Btg',
                    'unit_price' => $rental->over_pipe_price,
                    'total_price' => $cost,
                    'is_sub_item' => true,
                    'sort_key' => date('Ymd', strtotime($rental->date)) . '_P_' . $rental->id . '_2',
                ]);
                $subtotal += $cost;
            }
        }

        // Sort items by date and grouping
        $invoiceItems = $invoiceItems->sortBy('sort_key')->values();

        // 3. Ambil Payments (DP)
        $paymentQuery = $project->payments();
        if ($request->end_date) {
            $paymentQuery->where('date', '<=', $request->end_date);
        }
        $totalDP = $paymentQuery->sum('amount');

        // 4. Kalkulasi Grand Total
        $ppnRaw = 0;
        foreach ($invoiceItems as $item) {
            if ($item['type'] === 'shipment') {
                $ppnRaw += $item['total_price'] * 0.11;
            }
        }
        $ppn = $project->has_ppn ? $ppnRaw : 0;
        $grandTotal = ($subtotal + $ppn) - $totalDP;

        $terbilang = $this->terbilang($grandTotal) . ' Rupiah';

        $pdf = PDF::loadView('pdf.invoice.jkk_invoice', [
            'project' => $project,
            'customer' => $project->customer,
            'items' => $invoiceItems, // Pass items instead of shipments
            'totalVolume' => $totalVolume, // Explicit total volume of concrete
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

        if ($request->mark_as_billed) {
            $shipments->each->update(['is_billed' => true]);
            $pumpRentals->each->update(['is_billed' => true]);
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
