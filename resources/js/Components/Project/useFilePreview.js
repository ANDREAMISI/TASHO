import { useCallback, useState } from 'react';
import axios from 'axios';

/**
 * Charge l'aperçu d'un fichier via la route dédiée, puis expose le payload
 * au composant `FilePreviewDialog`.
 */
export default function useFilePreview() {
    const [file, setFile] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    const open = useCallback(async (target) => {
        if (!target?.id) {
            return;
        }

        setLoadingId(target.id);

        try {
            const { data } = await axios.get(route('files.preview', target.id));
            setFile(data);
        } catch (error) {
            console.error('Aperçu impossible :', error);
        } finally {
            setLoadingId(null);
        }
    }, []);

    const close = useCallback(() => setFile(null), []);

    return { file, loadingId, open, close };
}
