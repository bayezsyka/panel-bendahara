<!DOCTYPE html>
<html lang="id">
@php
    $slipLayout = $slipLayout ?? 'six-up';
@endphp
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji {{ $selectedCompany->name }} - {{ $selectedMonthLabel }}</title>
    @include('pdf.kas.partials.slip-gaji-four-up-styles')
</head>
<body>
    @include('pdf.kas.partials.slip-gaji-four-up-grid', [
        'slips' => $slips,
        'slipLayout' => $slipLayout,
    ])
</body>
</html>
