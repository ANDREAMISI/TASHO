import {
    ArrowDownTrayIcon,
    BellIcon,
    ChatBubbleLeftIcon,
    CloudArrowUpIcon,
    CreditCardIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    FolderIcon,
    HeartIcon,
    UsersIcon,
} from '@/Components/Icons';

/**
 * Apparence des notifications par type métier.
 * `tone` colore la pastille d'icône, `dot` le point d'état non lu.
 */
export const NOTIFICATION_META = {
    comment: {
        label: 'Commentaire',
        icon: ChatBubbleLeftIcon,
        tone: 'bg-violet-50 text-violet-600',
        dot: 'bg-violet-500',
    },
    favorite: {
        label: 'Favori',
        icon: HeartIcon,
        tone: 'bg-amber-50 text-amber-600',
        dot: 'bg-amber-500',
    },
    share_view: {
        label: 'Consultation',
        icon: EyeIcon,
        tone: 'bg-sky-50 text-sky-600',
        dot: 'bg-sky-500',
    },
    share_download: {
        label: 'Téléchargement',
        icon: ArrowDownTrayIcon,
        tone: 'bg-emerald-50 text-emerald-600',
        dot: 'bg-emerald-500',
    },
    upload: {
        label: 'Fichier',
        icon: CloudArrowUpIcon,
        tone: 'bg-indigo-50 text-indigo-600',
        dot: 'bg-indigo-500',
    },
    team: {
        label: 'Équipe',
        icon: UsersIcon,
        tone: 'bg-sky-50 text-sky-600',
        dot: 'bg-sky-500',
    },
    project: {
        label: 'Projet',
        icon: FolderIcon,
        tone: 'bg-indigo-50 text-indigo-600',
        dot: 'bg-indigo-500',
    },
    subscription: {
        label: 'Abonnement',
        icon: CreditCardIcon,
        tone: 'bg-amber-50 text-amber-600',
        dot: 'bg-amber-500',
    },
    storage: {
        label: 'Stockage',
        icon: ExclamationTriangleIcon,
        tone: 'bg-red-50 text-red-600',
        dot: 'bg-red-500',
    },
};

export function notificationMeta(type) {
    return (
        NOTIFICATION_META[type] || {
            label: 'Notification',
            icon: BellIcon,
            tone: 'bg-gray-100 text-gray-500',
            dot: 'bg-gray-400',
        }
    );
}
