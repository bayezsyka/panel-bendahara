<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <link rel="icon" href="/images/logo.png" type="image/png">

    <!-- Fonts -->
    <!-- <link rel="preconnect" href="https://fonts.bunny.net"> -->
    <!-- <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" /> -->

    <!-- Dark Mode Flash Prevention -->
    <script>
        (function() {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark') {
                document.documentElement.classList.add('dark', 'no-transition');
            } else {
                document.documentElement.classList.add('no-transition');
            }
            // Remove no-transition after first paint
            window.addEventListener('DOMContentLoaded', function() {
                requestAnimationFrame(function() {
                    document.documentElement.classList.remove('no-transition');
                });
            });
        })();
    </script>

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
