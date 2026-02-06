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
    public function view(User $user, Project $project): bool
    {
        return $project->office_id === app(OfficeContextService::class)->getCurrentOfficeId();
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->office_id === app(OfficeContextService::class)->getCurrentOfficeId();
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->office_id === app(OfficeContextService::class)->getCurrentOfficeId();
    }
}
