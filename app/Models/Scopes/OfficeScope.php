<?php

namespace App\Models\Scopes;

use App\Services\OfficeContextService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class OfficeScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $currentOfficeId = app(OfficeContextService::class)->getCurrentOfficeId();

        $builder->where($model->getTable() . '.office_id', $currentOfficeId);
    }
}
