import { Link } from '@inertiajs/react';
import DashboardCard from '@/Components/Dashboard/DashboardCard';
import {
    ArrowDownTrayIcon,
    ArrowRightIcon,
    ChatBubbleLeftIcon,
    CloudArrowUpIcon,
    EyeIcon,
    HeartIcon,
    PencilIcon,
    PlusIcon,
    ShareIcon,
    TrashIcon,
    UserIcon,
} from '@/Components/Icons';
import { timeAgo } from '@/utils/format';

const ICONS = {
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

const TONES = {
    upload: 'bg-indigo-50 text-indigo-600',
    download: 'bg-emerald-50 text-emerald-600',
    view: 'bg-gray-100 text-gray-500',
    comment: 'bg-violet-50 text-violet-600',
    favorite: 'bg-amber-50 text-amber-600',
    share: 'bg-sky-50 text-sky-600',
    delete: 'bg-red-50 text-red-600',
    update: 'bg-orange-50 text-orange-600',
    create: 'bg-emerald-50 text-emerald-600',
    authenticate: 'bg-cyan-50 text-cyan-600',
};

export default function ActivityFeed({ activities = [], className = '' }) {
    return (
        <DashboardCard
            title="Activité récente"
            description="Derniers événements sur vos projets"
            className={className}
            action={
                <Link
                    href={route('activity.index')}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tasho-primary transition hover:bg-tasho-primary/5"
                >
                    Tout voir
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
            }
        >
            {activities.length === 0 ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
                    <EyeIcon className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-600">
                        Aucune activité pour le moment
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Partagez un projet avec un client : ses consultations
                        apparaîtront ici.
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {activities.map((activity) => {
                        const Icon = ICONS[activity.action] || UserIcon;
                        const tone = TONES[activity.action] || 'bg-gray-100 text-gray-500';

                        return (
                            <li key={activity.id} className="flex gap-3">
                                <span
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-5 text-gray-700">
                                        <span className="font-medium text-gray-900">
                                            {activity.actor}
                                        </span>{' '}
                                        <span className="text-gray-500">
                                            · {activity.label}
                                        </span>
                                        {activity.file && (
                                            <>
                                                {' '}
                                                <span className="font-medium text-gray-800">
                                                    {activity.file}
                                                </span>
                                            </>
                                        )}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-400">
                                        {activity.project && (
                                            <span className="text-gray-500">
                                                {activity.project}
                                            </span>
                                        )}
                                        {activity.project && ' · '}
                                        {timeAgo(activity.created_at)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </DashboardCard>
    );
}
