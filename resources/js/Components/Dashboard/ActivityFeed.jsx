import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    CloudArrowUpIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ShareIcon,
    TrashIcon,
    PencilIcon,
    PlusIcon,
    UserIcon,
} from '@/Components/Icons';

const iconMap = {
    upload: CloudArrowUpIcon,
    download: ArrowDownTrayIcon,
    view: EyeIcon,
    comment: ChatBubbleLeftIcon,
    favorite: HeartIcon,
    share: ShareIcon,
    delete: TrashIcon,
    update: PencilIcon,
    create: PlusIcon,
    authenticate: UserIcon,
};

const colorMap = {
    upload: 'bg-blue-100 text-blue-600',
    download: 'bg-green-100 text-green-600',
    view: 'bg-gray-100 text-gray-600',
    comment: 'bg-purple-100 text-purple-600',
    favorite: 'bg-yellow-100 text-yellow-600',
    share: 'bg-indigo-100 text-indigo-600',
    delete: 'bg-red-100 text-red-600',
    update: 'bg-orange-100 text-orange-600',
    create: 'bg-emerald-100 text-emerald-600',
    authenticate: 'bg-cyan-100 text-cyan-600',
};

export default function ActivityFeed({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="flex justify-center">
                    <div className="rounded-full bg-gray-100 p-4">
                        <EyeIcon className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
                <p className="mt-4 text-gray-500">Aucune activité récente</p>
                <p className="text-sm text-gray-400 mt-1">
                    Commencez à utiliser TASHO pour voir les activités
                </p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {activities.map((activity, index) => {
                    const Icon = iconMap[activity.action] || UserIcon;
                    const color = colorMap[activity.action] || 'bg-gray-100 text-gray-600';

                    return (
                        <li key={activity.id || index}>
                            <div className="relative pb-8">
                                {index !== activities.length - 1 && (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                                )}
                                <div className="relative flex space-x-3">
                                    <div className="flex-shrink-0">
                                        <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center`}>
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-medium">{activity.user || 'Utilisateur'}</span>
                                            {' '}
                                            <span className="text-gray-500">{activity.action_label || activity.action}</span>
                                            {activity.file && (
                                                <>
                                                    {' '}
                                                    <span className="text-gray-500">le fichier</span>
                                                    {' '}
                                                    <span className="font-medium text-gray-700">{activity.file}</span>
                                                </>
                                            )}
                                            {activity.project && (
                                                <>
                                                    {' '}
                                                    <span className="text-gray-500">dans</span>
                                                    {' '}
                                                    <span className="font-medium text-gray-700">{activity.project}</span>
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatDistanceToNow(new Date(activity.created_at), {
                                                addSuffix: true,
                                                locale: fr,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}