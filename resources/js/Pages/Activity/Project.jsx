import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ShareIcon,
    LockIcon,
    UserIcon,
    ClockIcon,
    FolderIcon,
} from '@/Components/Icons';

export default function ActivityProject({ auth, project, logs, stats }) {
    const actionIcons = {
        upload: <PlusIcon className="h-4 w-4" />,
        download: <ArrowDownTrayIcon className="h-4 w-4" />,
        view: <EyeIcon className="h-4 w-4" />,
        comment: <ChatBubbleLeftIcon className="h-4 w-4" />,
        favorite: <HeartIcon className="h-4 w-4" />,
        share: <ShareIcon className="h-4 w-4" />,
        delete: <TrashIcon className="h-4 w-4" />,
        update: <PencilIcon className="h-4 w-4" />,
        create: <PlusIcon className="h-4 w-4" />,
        authenticate: <LockIcon className="h-4 w-4" />,
    };

    const actionColors = {
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Activité - ${project.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('activity.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Activité du projet
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <FolderIcon className="h-4 w-4 mr-1" />
                                {project.title}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Total actions</p>
                            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Vues</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {logs.filter(log => log.action === 'view').length}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Commentaires</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {logs.filter(log => log.action === 'comment').length}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Téléchargements</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {logs.filter(log => log.action === 'download').length}
                            </p>
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                Historique des actions
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start space-x-4">
                                            <span className={`p-2 rounded ${actionColors[log.action]}`}>
                                                {actionIcons[log.action]}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">
                                                            {log.action_label}
                                                        </span>
                                                        <span className="text-sm text-gray-500">par</span>
                                                        <span className="flex items-center text-sm text-gray-700">
                                                            <UserIcon className="h-3 w-3 mr-1" />
                                                            {log.user}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                                        <ClockIcon className="h-3 w-3" />
                                                        <span>{log.time_ago}</span>
                                                    </div>
                                                </div>
                                                {log.details && (
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        {Object.entries(log.details).map(([key, value]) => (
                                                            <span key={key} className="inline-block mr-4">
                                                                <span className="font-medium">{key}:</span> {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {log.ip_address && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        IP: {log.ip_address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">Aucune activité pour ce projet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}