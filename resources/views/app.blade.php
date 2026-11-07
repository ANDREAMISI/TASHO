<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <script>
        (() => {
            let theme;

            try {
                theme = localStorage.getItem('tasho-theme');
            } catch {
                theme = null;
            }

            if (theme !== 'light' && theme !== 'dark') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }

            document.documentElement.classList.toggle('dark', theme === 'dark');
            document.documentElement.style.colorScheme = theme;
        })();
    </script>

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="64x64" href="/Images/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/Images/apple-touch-icon.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
    <style>
        #app-bootstrap-loader {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            background: #edf3ff;
            color: #52647e;
            font: 500 0.875rem system-ui, sans-serif;
        }

        html.dark #app-bootstrap-loader {
            background: #060d20;
            color: #cbd5e1;
        }

        #app-bootstrap-loader .loader-orb {
            position: relative;
            width: 5rem;
            height: 5rem;
            overflow: hidden;
            border-radius: 50%;
            background: #d9eafa;
        }

        html.dark #app-bootstrap-loader .loader-orb {
            background: #13283b;
        }

        #app-bootstrap-loader .loader-orb::before {
            position: absolute;
            top: 42%;
            left: -50%;
            width: 200%;
            height: 200%;
            border-radius: 40%;
            background: #1b9cd8;
            content: "";
            animation: app-loader-wave 2.5s linear infinite;
        }

        @keyframes app-loader-wave {
            to {
                transform: rotate(360deg);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #app-bootstrap-loader .loader-orb::before {
                animation-duration: 8s;
            }
        }
    </style>
    <div id="app-bootstrap-loader" role="status" aria-label="Chargement de l’application">
        <span class="loader-orb" aria-hidden="true"></span>
        <span>Chargement de votre espace...</span>
    </div>
</body>
</html>
