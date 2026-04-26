<!DOCTYPE html>
<html lang="id">
@php
    $slipLayout = $slipLayout ?? 'six-up';
@endphp
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $slipGaji->employee_name }}</title>
    @include('pdf.kas.partials.slip-gaji-four-up-styles')
</head>
<body>
    @include('pdf.kas.partials.slip-gaji-four-up-grid', [
        'slips' => collect([$slipGaji]),
        'slipLayout' => $slipLayout,
    ])
</body>
</html>
