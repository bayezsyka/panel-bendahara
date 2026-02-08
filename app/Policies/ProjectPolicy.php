<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Services\OfficeContextService;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the project.
     */
    public function viewAny(User $user): bool
    {
        return $user->canAccessPanel(User::PANEL_FINANCE);
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        if (!$user->canAccessPanel(User::PANEL_FINANCE)) {
            return false;
        }

        // Superadmin can view all projects
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Bendahara restricted to own office
        return $user->office_id === $project->office_id;
    }

    /**
     * Determine whether the user can create projects.
     */
    public function create(User $user): bool
    {
        return $user->canManage(User::PANEL_FINANCE);
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        if (!$user->canManage(User::PANEL_FINANCE)) {
            return false;
        }

        // Superadmin Utama can update all
        if ($user->isSuperAdmin() && $user->isKantorUtama()) {
            return true;
        }

        return $user->office_id === $project->office_id;
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }
}
