<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Access is already restricted by 'superadmin.utama' middleware

        $users = User::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $offices = [
            ['id' => 1, 'name' => 'Kantor Utama'],
            ['id' => 2, 'name' => 'Kantor Plant'],
        ];

        return Inertia::render('Superadmin/Users/Index', [
            'users' => $users,
            'filters' => request()->only(['search']),
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {
        // Access restricted by middleware

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:superadmin,bendahara',
            'office_id' => 'required|integer|in:1,2',
            'is_active' => 'boolean',
            'allowed_panels' => 'nullable|array',
            'allowed_panels.*' => 'string|in:finance,kas,plant_cash,receivable,delivery', // added delivery, kas
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'office_id' => $validated['office_id'],
            'is_active' => $validated['is_active'] ?? true,
            'allowed_panels' => $validated['allowed_panels'] ?? [],
        ]);

        return redirect()->route('superadmin.users.index')
            ->with('message', 'User berhasil dibuat.');
    }

    public function update(Request $request, User $user)
    {
        // Access restricted by middleware

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string|in:superadmin,bendahara',
            'office_id' => 'required|integer|in:1,2',
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8',
            'allowed_panels' => 'nullable|array',
            'allowed_panels.*' => 'string|in:finance,kas,plant_cash,receivable,delivery', // added delivery, kas
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'office_id' => $validated['office_id'],
            'is_active' => $validated['is_active'],
            'allowed_panels' => $validated['allowed_panels'] ?? [],
        ]);

        // Hanya update password jika diisi
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        // Jika email atau password berubah, logout user (hapus session)
        if ($user->isDirty('email') || $user->isDirty('password')) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        $user->save();

        return redirect()->back()->with('message', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user)
    {
        if (!$request->user()->can('delete', $user)) {
            abort(403, 'Akses ditolak. Hubungi Admin Kantor Utama.');
        }

        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'Tidak bisa menghapus akun sendiri.']);
        }

        $user->delete();

        return redirect()->route('superadmin.users.index')
            ->with('message', 'User berhasil dihapus.');
    }
}
