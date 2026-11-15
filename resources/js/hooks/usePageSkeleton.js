import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

// Laisser passer un court délai évite de faire clignoter le squelette sur les
// navigations très rapides (cache Inertia, prefetch, etc.).
const SKELETON_DELAY = 150;

/**
 * Détecte les navigations Inertia qui changent réellement de page.
 *
 * Renvoie le chemin cible pendant le chargement, ou `null` sinon.
 * Les soumissions de formulaire (POST/PUT/PATCH/DELETE) et les rechargements
 * partiels (filtres, pagination, onglets) sont ignorés : ils gardent la page
 * affichée et gèrent leur propre état de chargement (bouton, liste, etc.).
 */
export default function usePageSkeleton() {
    const [path, setPath] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const clearTimer = () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const hideSkeleton = () => {
            clearTimer();
            setPath(null);
        };

        const unsubscribeStart = router.on('start', (event) => {
            const visit = event.detail.visit;

            if (visit.method.toLowerCase() !== 'get' || visit.prefetch) {
                return;
            }

            // Rechargements partiels : on conserve la page en place.
            if (visit.only?.length > 0 || visit.except?.length > 0) {
                return;
            }

            // Même chemin (tri, recherche, pagination…) : pas de squelette.
            if (visit.url.pathname === window.location.pathname) {
                return;
            }

            clearTimer();
            timerRef.current = window.setTimeout(() => {
                setPath(visit.url.pathname);
                timerRef.current = null;
            }, SKELETON_DELAY);
        });

        const unsubscribeFinish = router.on('finish', hideSkeleton);
        const unsubscribeCancel = router.on('cancel', hideSkeleton);
        const unsubscribeException = router.on('exception', hideSkeleton);

        return () => {
            hideSkeleton();
            unsubscribeStart();
            unsubscribeFinish();
            unsubscribeCancel();
            unsubscribeException();
        };
    }, []);

    return path;
}
