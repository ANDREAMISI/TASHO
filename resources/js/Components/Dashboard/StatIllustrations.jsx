import { useId } from 'react';

/**
 * Icônes illustrées du Dashboard, dans le style des dossiers de la galerie :
 * formes pleines, dégradés doux et couleurs par indicateur.
 */

export function FolderStatIcon({ className = '' }) {
    const uid = useId().replace(/:/g, '');
    const backId = `stat-folder-back-${uid}`;
    const frontId = `stat-folder-front-${uid}`;

    return (
        <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
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

            <g transform="translate(0 12)">
                {/* Partie arrière + onglet */}
                <path
                    d="M2 16c0-4.4 3.6-8 8-8h28.4c2.7 0 5.2 1.3 6.8 3.4l7.3 9.6H118c4.4 0 8 3.6 8 8v61c0 4.4-3.6 8-8 8H10c-4.4 0-8-3.6-8-8V16Z"
                    fill={`url(#${backId})`}
                />

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
            </g>
        </svg>
    );
}

export function FileStatIcon({ className = '' }) {
    const uid = useId().replace(/:/g, '');
    const bodyId = `stat-file-body-${uid}`;
    const foldId = `stat-file-fold-${uid}`;

    return (
        <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#DDEFFB" />
                </linearGradient>
                <linearGradient id={foldId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#CBE7F8" />
                    <stop offset="100%" stopColor="#9FD2F0" />
                </linearGradient>
            </defs>

            <path
                d="M28 10h48v24a6 6 0 0 0 6 6h18v72a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8Z"
                fill={`url(#${bodyId})`}
            />
            <path d="M76 10l24 24H82a6 6 0 0 1-6-6V10Z" fill={`url(#${foldId})`} />
            <path
                d="M34 62h56M34 76h56M34 90h34"
                stroke="#8AC8E9"
                strokeWidth="5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function UsersStatIcon({ className = '' }) {
    const uid = useId().replace(/:/g, '');
    const backId = `stat-users-back-${uid}`;
    const frontId = `stat-users-front-${uid}`;

    return (
        <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={backId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8EED7" />
                    <stop offset="100%" stopColor="#78D9B4" />
                </linearGradient>
                <linearGradient id={frontId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4AD59B" />
                    <stop offset="100%" stopColor="#0F9F6E" />
                </linearGradient>
            </defs>

            {/* Personne arrière */}
            <circle cx="44" cy="46" r="17" fill={`url(#${backId})`} />
            <path
                d="M14 112c0-16 13-29 30-29s30 13 30 29v4H14v-4Z"
                fill={`url(#${backId})`}
            />

            {/* Personne avant */}
            <circle cx="84" cy="50" r="19" fill={`url(#${frontId})`} />
            <path
                d="M50 118c0-18 15-32 34-32s34 14 34 32v2H50v-2Z"
                fill={`url(#${frontId})`}
            />
        </svg>
    );
}

export function StorageStatIcon({ className = '' }) {
    const uid = useId().replace(/:/g, '');
    const cloudId = `stat-storage-cloud-${uid}`;

    return (
        <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={cloudId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE28A" />
                    <stop offset="100%" stopColor="#F2B01E" />
                </linearGradient>
            </defs>

            <path
                d="M36 100c-14 0-25-11-25-25 0-12 9-22 21-24 4-16 18-28 35-28 19 0 35 15 37 34 10 2 17 11 17 22 0 12-10 21-22 21H36Z"
                fill={`url(#${cloudId})`}
            />
            <path
                d="M36 100c-14 0-25-11-25-25 0-2 .2-4 .6-6 3 9 11 16 21 16h62c6 0 12-3 16-7 1 2 1 4 1 6 0 12-10 21-22 21H36Z"
                fill="#E8A117"
                opacity="0.35"
            />
        </svg>
    );
}
