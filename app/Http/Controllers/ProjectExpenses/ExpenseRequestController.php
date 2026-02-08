<?php

namespace App\Http\Controllers\ProjectExpenses;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseRequestController extends Controller
{
    public function index()
    {
        $requests = ExpenseRequest::query()
            ->with(['project:id,name', 'mandor:id,name,whatsapp_number'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $expenseTypes = \App\Models\ExpenseType::all();

        return Inertia::render('ProjectExpenses/ExpenseRequests/Index', [
            'requests' => $requests,
            'expenseTypes' => $expenseTypes,
        ]);
    }

    public function approve(Request $request, ExpenseRequest $expenseRequest)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transacted_at' => 'required|date',
            'description' => 'nullable|string',
            'expense_type_id' => 'required|exists:expense_types,id',
        ]);

        if ($expenseRequest->status !== 'pending') {
            return redirect()->back()->with('message', 'Request ini sudah diproses.');
        }

        DB::transaction(function () use ($request, $expenseRequest) {
            // Update data hasil review bendahara
            $expenseRequest->title = $request->title;
            $expenseRequest->amount = $request->amount;
            $expenseRequest->transacted_at = $request->transacted_at;
            $expenseRequest->description = $request->description;

            // Buat Expense final
            $expense = Expense::create([
                'project_id' => $expenseRequest->project_id,
                'expense_type_id' => $request->expense_type_id,
                'title' => $expenseRequest->title,
                'description' => $expenseRequest->description ?? 'Dikonfirmasi bendahara',
                'amount' => $expenseRequest->amount,
                'receipt_image' => $expenseRequest->receipt_image,
                'transacted_at' => $expenseRequest->transacted_at,
            ]);

            // Jika request dari struk (AI), salin item-item
            $items = $expenseRequest->items ?? [];
            if (is_array($items) && count($items) > 0) {
                foreach ($items as $item) {
                    $qty = (int)($item['quantity'] ?? 1);
                    $price = (float)($item['price'] ?? 0);
                    $total = (float)($item['total'] ?? ($qty * $price));

                    $expense->items()->create([
                        'name' => (string)($item['name'] ?? 'Item'),
                        'quantity' => max(1, $qty),
                        'price' => max(0, $price),
                        'total_price' => max(0, $total),
                    ]);
                }
            } else {
                // Jika nominal saja, buat 1 item ringkas agar konsisten dengan UI existing
                $expense->items()->create([
                    'name' => $expenseRequest->title,
                    'quantity' => 1,
                    'price' => $expenseRequest->amount,
                    'total_price' => $expenseRequest->amount,
                ]);
            }

            $expenseRequest->status = 'approved';
            $expenseRequest->expense_id = $expense->id;
            $expenseRequest->approved_by = Auth::id();
            $expenseRequest->approved_at = now();
            $expenseRequest->save();
        });

        return redirect()->back()->with('message', '✅ Request disetujui & masuk ke sistem.');
    }

    public function reject(Request $request, ExpenseRequest $expenseRequest)
    {
        $request->validate([
            'review_note' => 'nullable|string',
        ]);

        if ($expenseRequest->status !== 'pending') {
            return redirect()->back()->with('message', 'Request ini sudah diproses.');
        }

        $expenseRequest->status = 'rejected';
        $expenseRequest->rejected_by = Auth::id();
        $expenseRequest->rejected_at = now();
        $expenseRequest->review_note = $request->review_note;
        $expenseRequest->save();

        return redirect()->back()->with('message', '🗑️ Request ditolak.');
    }
}
