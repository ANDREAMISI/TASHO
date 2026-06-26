import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    PlusIcon,
    FolderIcon,
    DocumentIcon,
    ClockIcon,
    UserIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    FilterIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
} from '@/Components/Icons';

export default function ProjectIndex({ auth, projects, filters, statuses, priorities, team }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

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

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('projects.index'), {
            search: searchTerm,
            status: statusFilter,
        }, {
            preserveState: true,
        });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get(route('projects.index'), {
            search: searchTerm,
            status: status,
        }, {
            preserveState: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('projects.index'), {}, {
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Projets - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Projets</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {team.name} · {projects.total || 0} projets au total
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href={route('projects.create')}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nouveau projet
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher un projet..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tasho-primary focus:border-tasho-primary"
                                    />
                                </div>
                            </form>

                            <div className="flex items-center space-x-2">
                                <FilterIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Filtrer par :</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-tasho-primary focus:border-tasho-primary"
                                >
                                    <option value="">Tous les statuts</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {statusLabels[status]}
                                        </option>
                                    ))}
                                </select>

                                {(searchTerm || statusFilter) && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {projects.data && projects.data.length > 0 ? (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route('projects.show', project.id)}
                                    className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-tasho-primary/20 group"
                                >
                                    {/* Project Card */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-tasho-primary transition">
                                                    {project.title}
                                                </h3>
                                                {project.client_name && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        Client: {project.client_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                                                    {statusLabels[project.status]}
                                                </span>
                                            </div>
                                        </div>

                                        {project.description && (
                                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center">
                                                    <FolderIcon className="h-4 w-4 mr-1" />
                                                    {project.folders_count || 0}
                                                </span>
                                                <span className="flex items-center">
                                                    <DocumentIcon className="h-4 w-4 mr-1" />
                                                    {project.files_count || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                                                    {priorityLabels[project.priority]}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-tasho-primary">
                                                        {project.owner.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {project.owner.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(project.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="mt-12 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <FolderIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Aucun projet
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter 
                                    ? 'Aucun projet ne correspond à vos filtres'
                                    : 'Commencez à créer votre premier projet'}
                            </p>
                            {(searchTerm || statusFilter) && (
                                <button
                                    onClick={resetFilters}
                                    className="mt-4 text-sm text-tasho-primary hover:underline"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                            {!searchTerm && !statusFilter && (
                                <div className="mt-6">
                                    <Link
                                        href={route('projects.create')}
                                        className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Créer un projet
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {projects.links && projects.links.length > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center space-x-1">
                                {projects.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (link.url && !link.active) {
                                                router.get(link.url, {}, { preserveState: true });
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            link.active
                                                ? 'bg-tasho-primary text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!link.url}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}