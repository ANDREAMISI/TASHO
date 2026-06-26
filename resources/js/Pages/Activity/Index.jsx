import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChartBarIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    UserIcon,
    FolderIcon,
    DocumentIcon,
    ClockIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ShareIcon,
    TrashIcon,
    PencilIcon,
    PlusIcon,
    LockIcon,
    XMarkIcon,
    FilterIcon,
    CalendarIcon,
} from '@/Components/Icons';

export default function ActivityIndex({ auth, logs, stats, filters, actions, projects, users }) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

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

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const applyFilters = (newFilters) => {
        router.get(route('activity.index'), {
            ...filters,
            ...newFilters,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm('');
        router.get(route('activity.index'), {}, { preserveState: true });
    };

    const exportLogs = () => {
        window.open(route('activity.export', filters), '_blank');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Activité - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Activité</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Journal complet de toutes les actions
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <button
                                onClick={exportLogs}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Exporter
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Filtres
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Total actions</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_actions}</p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Actions aujourd'hui</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.daily && Object.keys(stats.daily).length > 0 
                                    ? stats.daily[Object.keys(stats.daily).pop()] || 0
                                    : 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Utilisateurs</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {logs.data ? new Set(logs.data.map(log => log.user?.id)).size : 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <p className="text-sm text-gray-500">Projets actifs</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {logs.data ? new Set(logs.data.map(log => log.project?.id).filter(Boolean)).size : 0}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Action
                                    </label>
                                    <select
                                        value={filters.action || ''}
                                        onChange={(e) => applyFilters({ action: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Toutes</option>
                                        {Object.entries(actions).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Utilisateur
                                    </label>
                                    <select
                                        value={filters.user_id || ''}
                                        onChange={(e) => applyFilters({ user_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Tous</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Projet
                                    </label>
                                    <select
                                        value={filters.project_id || ''}
                                        onChange={(e) => applyFilters({ project_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Tous</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="date"
                                            value={filters.date_from || ''}
                                            onChange={(e) => applyFilters({ date_from: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary text-sm"
                                        />
                                        <span className="text-gray-400">à</span>
                                        <input
                                            type="date"
                                            value={filters.date_to || ''}
                                            onChange={(e) => applyFilters({ date_to: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {(filters.action || filters.user_id || filters.project_id || filters.date_from || filters.date_to) && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <div className="mt-6">
                        <form onSubmit={handleSearch} className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher une activité..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-tasho-primary focus:border-tasho-primary"
                            />
                        </form>
                    </div>

                    {/* Logs Table */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Utilisateur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Projet / Fichier
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Détails
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data && logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`p-1 rounded ${actionColors[log.action]}`}>
                                                            {actionIcons[log.action]}
                                                        </span>
                                                        <span className="ml-2 text-sm text-gray-900">
                                                            {log.action_label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-medium text-tasho-primary">
                                                                {log.user ? log.user.name.charAt(0).toUpperCase() : 'A'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {log.user ? log.user.name : (log.visitor_name || 'Anonyme')}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {log.user ? log.user.email : (log.visitor_email || '')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {log.project && (
                                                            <Link
                                                                href={route('projects.show', log.project.id)}
                                                                className="text-sm text-tasho-primary hover:underline flex items-center"
                                                            >
                                                                <FolderIcon className="h-3 w-3 mr-1" />
                                                                {log.project.title}
                                                            </Link>
                                                        )}
                                                        {log.file && (
                                                            <p className="text-sm text-gray-500 flex items-center">
                                                                <DocumentIcon className="h-3 w-3 mr-1" />
                                                                {log.file.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {log.details ? JSON.stringify(log.details) : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(log.created_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {log.time_ago}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="rounded-full bg-gray-100 p-4">
                                                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-gray-500">Aucune activité enregistrée</p>
                                                <p className="text-sm text-gray-400">
                                                    Les actions seront affichées ici au fur et à mesure
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.links && logs.links.length > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Affichage de {logs.from || 0} à {logs.to || 0} sur {logs.total || 0} résultats
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        {logs.links.map((link, index) => (
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}