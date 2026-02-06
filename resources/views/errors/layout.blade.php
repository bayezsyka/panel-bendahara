<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - JKK Panel Bendahara</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <!-- Tailwind CSS (via CDN for simplicity in error pages) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>

<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-6">
    <div class="max-w-xl w-full text-center">
        <div class="mb-12">
            <div class="relative w-64 h-64 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 bg-@yield('color', 'indigo')-100 rounded-full animate-pulse opacity-50 scale-75">
                </div>
                <span class="text-9xl font-black text-@yield('color', 'indigo')-200 select-none">@yield('code')</span>
            </div>
        </div>

        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
            @yield('message')
        </h1>

        <p class="text-lg text-gray-500 font-medium mb-10">
            @yield('description')
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/"
                class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1">
                Kembali ke Beranda
            </a>
        </div>

        <div
            class="mt-16 text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-4">
            <span>&copy; {{ date('Y') }} JKK Panel Bendahara</span>
        </div>
    </div>
</body>

</html>
