import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    UserIcon,
    FolderIcon,
    DocumentIcon,
    CalendarIcon,
    ClockIcon,
    FilterIcon,
    ArrowDownTrayIcon,
} from '@/Components/Icons';

export default function AdminActivityIndex({ auth, logs, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.activity.index'), { search: searchTerm }, { preserveState: true });
    };

    const getActionColor = (action) => {
        const colors = {
            upload: 'bg-blue-100 text-blue-600',
            download: 'bg-green-100 text-green-600',
            view: 'bg-gray-100 text-gray-600',
            comment: 'bg-purple-100 text-purple-600',
            favorite: 'bg-yellow-100 text-yellow-600',
            share: 'bg-indigo-100 text-indigo-600',
            delete: 'bg-red-100 text-red-600',
            update: 'bg-orange-100 text-orange-600',
            create: 'bg-emerald-100 text-emerald-600',
            login: 'bg-cyan-100 text-cyan-600',
            logout: 'bg-gray-100 text-gray-600',
        };
        return colors[action] || 'bg-gray-100 text-gray-600';
    };

    const getActionLabel = (action) => {
        const labels = {
            upload: 'Upload',
            download: 'Téléchargement',
            view: 'Visualisation',
            comment: 'Commentaire',
            favorite: 'Favori',
            share: 'Partage',
            delete: 'Suppression',
            update: 'Mise à jour',
            create: 'Création',
            login: 'Connexion',
            logout: 'Déconnexion',
        };
        return labels[action] || action;
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Activité - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Activité</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Journal d'activité de la plateforme
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Filtres
                            </button>
                            <button
                                onClick={() => window.open(route('admin.activity.export'), '_blank')}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Exporter
                            </button>
                        </div>
                    </div>

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
                                            IP
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                        {getActionLabel(log.action)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-tasho-primary">
                                                                {log.user?.name?.charAt(0).toUpperCase() || 'A'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {log.user?.name || 'Anonyme'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {log.user?.email || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {log.project && (
                                                            <p className="text-sm text-gray-600 flex items-center">
                                                                <FolderIcon className="h-3 w-3 mr-1" />
                                                                {log.project.title}
                                                            </p>
                                                        )}
                                                        {log.file && (
                                                            <p className="text-sm text-gray-500 flex items-center">
                                                                <DocumentIcon className="h-3 w-3 mr-1" />
                                                                {log.file.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.ip_address || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(log.created_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <p className="text-gray-500">Aucune activité enregistrée</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}