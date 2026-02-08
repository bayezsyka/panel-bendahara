<?php

namespace App\Policies;

use App\Models\ReceivableTransaction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReceivableTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessPanel(User::PANEL_RECEIVABLE);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ReceivableTransaction $receivableTransaction): bool
    {
        return $user->canAccessPanel(User::PANEL_RECEIVABLE);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->canCreate(User::PANEL_RECEIVABLE);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ?ReceivableTransaction $receivableTransaction = null): bool
    {
        return $user->canManage(User::PANEL_RECEIVABLE);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ?ReceivableTransaction $receivableTransaction = null): bool
    {
        return $user->canManage(User::PANEL_RECEIVABLE);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ReceivableTransaction $receivableTransaction): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ReceivableTransaction $receivableTransaction): bool
    {
        return false;
    }
}
