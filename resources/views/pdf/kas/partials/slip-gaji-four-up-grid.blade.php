@php
    $slipLayout = $slipLayout ?? 'six-up';
    $slotsPerSheet = $slipLayout === 'six-up' ? 6 : ($slipLayout === 'single' ? 1 : 2);
    $slipChunks = collect($slips)->values()->chunk($slotsPerSheet);
@endphp

@foreach ($slipChunks as $chunk)
    <div class="sheet">
        @for ($slot = 0; $slot < $slotsPerSheet; $slot++)
            <div class="slot slot-{{ $slot + 1 }}">
                @if ($chunk->has($slot))
                    @include('pdf.kas.partials.slip-gaji-card', ['slipGaji' => $chunk->get($slot)])
                @endif
            </div>
        @endfor
    </div>
@endforeach
