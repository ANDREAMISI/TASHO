import { Link } from '@inertiajs/react';
import { Button as PrimeButton } from 'primereact/button';

/**
 * Bouton unique de l'application.
 *
 * S'appuie sur PrimeReact Button (icônes, loading, tooltip…) et centralise les
 * variantes visuelles de TASHO. Le rayon de 5px est appliqué globalement dans
 * `resources/css/app.css`, pour les boutons PrimeReact comme pour les boutons
 * natifs et les champs de formulaire.
 *
 * Variantes disponibles : primary, secondary, danger, danger-outline, success,
 * ghost et dark. Sans variante, les props PrimeReact (severity, outlined, text,
 * rounded…) sont transmises telles quelles.
 *
 * Avec la prop `href`, le composant rend un lien Inertia avec les mêmes
 * variantes (ex. : `<Button href="/projects" variant="secondary">…</Button>`).
 */
const VARIANTS = {
    primary: {
        className:
            '!border-tasho-primary !bg-tasho-primary hover:!border-tasho-primary hover:!bg-tasho-primary/90',
    },
    secondary: {
        severity: 'secondary',
        outlined: true,
    },
    danger: {
        severity: 'danger',
    },
    'danger-outline': {
        severity: 'danger',
        outlined: true,
    },
    success: {
        severity: 'success',
    },
    ghost: {
        severity: 'secondary',
        text: true,
    },
    dark: {
        className:
            '!border-gray-800 !bg-gray-800 !text-white hover:!border-gray-700 hover:!bg-gray-700',
    },
};

/** Classes utilisées lorsque le bouton est un lien (prop `href`). */
const LINK_BASE =
    'inline-flex items-center justify-center gap-1.5 rounded-[5px] px-3.5 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
const LINK_VARIANTS = {
    primary:
        'border border-transparent bg-tasho-primary text-white hover:bg-tasho-primary/90 focus-visible:ring-tasho-primary',
    secondary:
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300',
    danger:
        'border border-transparent bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
    'danger-outline':
        'border border-red-300 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-400',
    success:
        'border border-transparent bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
    ghost:
        'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-300',
    dark:
        'border border-transparent bg-gray-800 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
};

export default function Button({ variant, href, className = '', ...props }) {
    if (href) {
        return (
            <Link
                href={href}
                className={`${LINK_BASE} ${LINK_VARIANTS[variant] ?? LINK_VARIANTS.primary} ${className}`.trim()}
                {...props}
            />
        );
    }

    const variantProps = (variant && VARIANTS[variant]) || {};
    const { className: variantClassName = '', ...variantRest } = variantProps;

    return (
        <PrimeButton
            {...variantRest}
            {...props}
            className={`${variantClassName} ${className}`.trim()}
        />
    );
}
