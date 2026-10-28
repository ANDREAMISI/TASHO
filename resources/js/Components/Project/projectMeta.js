import {
    ArrowDownTrayIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    DocumentTextIcon,
    EyeIcon,
    FolderOpenIcon,
    HeartIcon,
    PencilIcon,
    PhotoIcon,
    PlayIcon,
    PlusIcon,
    ShareIcon,
    TrashIcon,
    UserIcon,
    VideoCameraIcon,
} from '@/Components/Icons';

/**
 * Statuts de projet : libellé, sévérité PrimeReact et pastille.
 */
export const PROJECT_STATUSES = {
    draft: {
        label: 'Brouillon',
        severity: 'secondary',
        dot: 'bg-gray-400',
    },
    active: {
        label: 'Actif',
        severity: 'success',
        dot: 'bg-emerald-500',
    },
    completed: {
        label: 'Terminé',
        severity: 'info',
        dot: 'bg-sky-500',
    },
    archived: {
        label: 'Archivé',
        severity: 'warning',
        dot: 'bg-amber-500',
    },
};

export function statusMeta(status) {
    return (
        PROJECT_STATUSES[status] || {
            label: status || 'Inconnu',
            severity: 'secondary',
            dot: 'bg-gray-300',
        }
    );
}

/**
 * Priorités de projet.
 */
export const PROJECT_PRIORITIES = {
    low: { label: 'Basse', dot: 'bg-gray-300', tone: 'text-gray-500' },
    medium: { label: 'Moyenne', dot: 'bg-amber-400', tone: 'text-amber-600' },
    high: { label: 'Haute', dot: 'bg-red-500', tone: 'text-red-600' },
};

export function priorityMeta(priority) {
    return (
        PROJECT_PRIORITIES[priority] || {
            label: priority || '—',
            dot: 'bg-gray-300',
            tone: 'text-gray-500',
        }
    );
}

/**
 * Familles de fichiers : icône, libellé et teinte.
 */
export const FILE_CATEGORIES = {
    images: {
        label: 'Images',
        icon: PhotoIcon,
        tone: 'bg-sky-50 text-sky-600',
        bar: 'bg-sky-500',
    },
    videos: {
        label: 'Vidéos',
        icon: VideoCameraIcon,
        tone: 'bg-violet-50 text-violet-600',
        bar: 'bg-violet-500',
    },
    documents: {
        label: 'Documents',
        icon: DocumentTextIcon,
        tone: 'bg-orange-50 text-orange-600',
        bar: 'bg-orange-500',
    },
    audio: {
        label: 'Audio',
        icon: PlayIcon,
        tone: 'bg-emerald-50 text-emerald-600',
        bar: 'bg-emerald-500',
    },
    archives: {
        label: 'Archives',
        icon: FolderOpenIcon,
        tone: 'bg-amber-50 text-amber-600',
        bar: 'bg-amber-500',
    },
    others: {
        label: 'Autres',
        icon: DocumentIcon,
        tone: 'bg-gray-100 text-gray-500',
        bar: 'bg-gray-400',
    },
};

export function categoryMeta(category) {
    return FILE_CATEGORIES[category] || FILE_CATEGORIES.others;
}

export const FILE_CATEGORY_OPTIONS = Object.entries(FILE_CATEGORIES).map(
    ([value, meta]) => ({ value, label: meta.label }),
);

/**
 * Actions journalisées : icône, libellé et teinte.
 */
export const ACTIVITY_ACTIONS = {
    upload: {
        label: 'Téléversement',
        icon: CloudArrowUpIcon,
        tone: 'bg-indigo-50 text-indigo-600',
    },
    download: {
        label: 'Téléchargement',
        icon: ArrowDownTrayIcon,
        tone: 'bg-emerald-50 text-emerald-600',
    },
    view: {
        label: 'Consultation',
        icon: EyeIcon,
        tone: 'bg-gray-100 text-gray-500',
    },
    comment: {
        label: 'Commentaire',
        icon: ChatBubbleLeftIcon,
        tone: 'bg-violet-50 text-violet-600',
    },
    favorite: {
        label: 'Ajout aux favoris',
        icon: HeartIcon,
        tone: 'bg-amber-50 text-amber-600',
    },
    share: {
        label: 'Partage',
        icon: ShareIcon,
        tone: 'bg-sky-50 text-sky-600',
    },
    delete: {
        label: 'Suppression',
        icon: TrashIcon,
        tone: 'bg-red-50 text-red-600',
    },
    update: {
        label: 'Modification',
        icon: PencilIcon,
        tone: 'bg-orange-50 text-orange-600',
    },
    create: {
        label: 'Création',
        icon: PlusIcon,
        tone: 'bg-emerald-50 text-emerald-600',
    },
    authenticate: {
        label: 'Connexion',
        icon: UserIcon,
        tone: 'bg-cyan-50 text-cyan-600',
    },
};

export function activityMeta(action) {
    return (
        ACTIVITY_ACTIONS[action] || {
            label: action || 'Action',
            icon: ChartBarIcon,
            tone: 'bg-gray-100 text-gray-500',
        }
    );
}

/**
 * Rôles d'un membre de projet.
 */
export const MEMBER_ROLES = {
    manager: 'Gestionnaire',
    editor: 'Éditeur',
    viewer: 'Lecteur',
};
