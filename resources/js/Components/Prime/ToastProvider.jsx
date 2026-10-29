import { createContext, useContext, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext(null);

/**
 * Fournit un Toast PrimeReact unique pour toute l'application cliente.
 * Les messages flash Laravel (success, error, info) sont affichés
 * automatiquement après chaque réponse Inertia.
 */
export function ToastProvider({ children }) {
    const toastRef = useRef(null);
    const flash = usePage().props.flash;
    const lastFlash = useRef(null);

    const show = (severity, summary, detail, life = 3500) => {
        toastRef.current?.show({ severity, summary, detail, life });
    };

    const toast = {
        show,
        success: (detail, summary = 'Succès') => show('success', summary, detail),
        error: (detail, summary = 'Erreur') => show('error', summary, detail),
        info: (detail, summary = 'Information') => show('info', summary, detail),
        warn: (detail, summary = 'Attention') => show('warn', summary, detail),
    };

    useEffect(() => {
        if (!flash || typeof flash !== 'object') {
            return;
        }

        // Chaque réponse Inertia fournit un nouvel objet `flash`.
        // On s'appuie sur son identité pour ne pas réafficher le même
        // message lors d'un simple re-rendu, tout en autorisant deux
        // messages identiques issus de deux actions différentes.
        if (flash === lastFlash.current) {
            return;
        }

        lastFlash.current = flash;

        [
            ['success', flash.success],
            ['error', flash.error],
            ['info', flash.info],
        ]
            .filter(([, detail]) => Boolean(detail))
            .forEach(([severity, detail]) => show(severity, undefined, detail));
    }, [flash]);

    return (
        <ToastContext.Provider value={toast}>
            <Toast ref={toastRef} position="top-right" />
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast doit être utilisé dans un ToastProvider.');
    }

    return context;
}
