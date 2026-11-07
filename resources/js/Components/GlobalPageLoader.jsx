import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import LiquidWaveSpinner from '@/Components/shadcn-space/spinner/spinner-10';

const LOADER_DELAY = 180;

export default function GlobalPageLoader() {
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        document.getElementById('app-bootstrap-loader')?.remove();

        const clearPendingLoader = () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const unsubscribeStart = router.on('start', () => {
            clearPendingLoader();
            timerRef.current = window.setTimeout(() => {
                setIsLoading(true);
                timerRef.current = null;
            }, LOADER_DELAY);
        });

        const unsubscribeFinish = router.on('finish', () => {
            clearPendingLoader();
            setIsLoading(false);
        });

        const unsubscribeCancel = router.on('cancel', () => {
            clearPendingLoader();
            setIsLoading(false);
        });

        const unsubscribeException = router.on('exception', () => {
            clearPendingLoader();
            setIsLoading(false);
        });

        return () => {
            clearPendingLoader();
            unsubscribeStart();
            unsubscribeFinish();
            unsubscribeCancel();
            unsubscribeException();
        };
    }, []);

    if (!isLoading) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#edf3ff]/90 p-6 backdrop-blur-sm dark:bg-[#060d20]/85"
            role="status"
            aria-label="Chargement de la page"
        >
            <LiquidWaveSpinner
                size="md"
                className="max-w-sm rounded-2xl py-6"
            />
        </div>
    );
}
