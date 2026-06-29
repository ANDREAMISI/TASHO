import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    FolderIcon,
    DocumentIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    PlusIcon,
    CloudArrowUpIcon,
} from '@/Components/Icons';

export default function ProjectShow({ auth, project, team }) {
    const statusLabels = {
        draft: 'Brouillon',
        active: 'Actif',
        archived: 'Archivé',
        completed: 'Terminé',
    };

    const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        active: 'bg-green-100 text-green-800',
        archived: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800',
    };

    const priorityLabels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute',
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-600',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${project.title} - TASHO`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('projects.index')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {project.title}
                                </h1>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                                        {statusLabels[project.status]}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                                        {priorityLabels[project.priority]}
                                    </span>
                                    {project.client_name && (
                                        <span className="text-sm text-gray-500">
                                            Client: {project.client_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link
                                href={route('files.index', project.id)}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <FolderIcon className="h-4 w-4 mr-2" />
                                Voir les fichiers
                            </Link>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Project Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500">Description</h3>
                            <p className="mt-2 text-gray-900">
                                {project.description || 'Aucune description'}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500">Détails</h3>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Propriétaire: {project.owner?.name}</span>
                                </div>
                                {project.start_date && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Début: {new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}
                                {project.end_date && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Fin: {new Date(project.end_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600">
                                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Créé le: {new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500">Statistiques</h3>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Fichiers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Dossiers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Membres</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Commentaires</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href={route('files.index', project.id)}
                            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition text-center"
                        >
                            <FolderIcon className="h-8 w-8 mx-auto text-tasho-primary" />
                            <p className="mt-2 font-medium text-gray-900">Gérer les fichiers</p>
                            <p className="text-sm text-gray-500">Uploader et organiser vos fichiers</p>
                        </Link>
                        <Link
                            href={route('shares.index', { project_id: project.id })}
                            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition text-center"
                        >
                            <CloudArrowUpIcon className="h-8 w-8 mx-auto text-tasho-primary" />
                            <p className="mt-2 font-medium text-gray-900">Partager</p>
                            <p className="text-sm text-gray-500">Partager avec vos clients</p>
                        </Link>
                        <Link
                            href={route('activity.project', project.id)}
                            className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition text-center"
                        >
                            <EyeIcon className="h-8 w-8 mx-auto text-tasho-primary" />
                            <p className="mt-2 font-medium text-gray-900">Activité</p>
                            <p className="text-sm text-gray-500">Voir l'historique du projet</p>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                        <div className="mt-4">
                            <div className="text-center py-8 text-gray-500">
                                <p>Aucune activité récente</p>
                                <p className="text-sm">Commencez à utiliser ce projet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}