import 'react-international-phone/style.css';
import '../css/app.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { PrimeReactProvider } from 'primereact/api';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Le squelette HTML de démarrage n'est utile que le temps du premier
        // rendu React : on le retire après la première frame peinte.
        window.requestAnimationFrame(() => {
            document.getElementById('app-bootstrap-loader')?.remove();
        });

        root.render(
            <PrimeReactProvider>
                <App {...props} />
            </PrimeReactProvider>,
        );
    },
    progress: false,
});
