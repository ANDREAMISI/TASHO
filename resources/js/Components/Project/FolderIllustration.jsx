import { useId } from 'react';

/**
 * Icône de dossier "bureau" utilisée dans la grille des dossiers.
 * `filled` laisse dépasser une feuille pour un dossier non vide.
 */
export default function FolderIllustration({ filled = false, className = '' }) {
    const uid = useId().replace(/:/g, '');
    const backId = `folder-back-${uid}`;
    const frontId = `folder-front-${uid}`;

    return (
        <svg
            viewBox="0 0 128 104"
            className={className}
            role="presentation"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={backId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F6C34B" />
                    <stop offset="100%" stopColor="#E8A117" />
                </linearGradient>
                <linearGradient id={frontId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD96A" />
                    <stop offset="100%" stopColor="#F0AF1F" />
                </linearGradient>
            </defs>

            {/* Partie arrière + onglet */}
            <path
                d="M2 16c0-4.4 3.6-8 8-8h28.4c2.7 0 5.2 1.3 6.8 3.4l7.3 9.6H118c4.4 0 8 3.6 8 8v61c0 4.4-3.6 8-8 8H10c-4.4 0-8-3.6-8-8V16Z"
                fill={`url(#${backId})`}
            />

            {/* Feuille qui dépasse quand le dossier contient des éléments */}
            {filled && (
                <g>
                    <rect x="36" y="10" width="56" height="46" rx="4" fill="#FBFAF7" />
                    <path
                        d="M44 24h40M44 32h40M44 40h26"
                        stroke="#D9D6CF"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </g>
            )}

            {/* Partie avant */}
            <path
                d="M0 42c0-4.4 3.6-8 8-8h112c4.4 0 8 3.6 8 8v50c0 4.4-3.6 8-8 8H8c-4.4 0-8-3.6-8-8V42Z"
                fill={`url(#${frontId})`}
            />
            <path
                d="M0 42c0-4.4 3.6-8 8-8h112c4.4 0 8 3.6 8 8v2.5H0V42Z"
                fill="#fff"
                opacity="0.35"
            />
        </svg>
    );
}
