import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    TrashIcon,
    UserGroupIcon,
    UsersIcon,
    CalendarIcon,
    CheckIcon,
    XMarkIcon,
} from '@/Components/Icons';

export default function TeamsIndex({ auth, teams }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.teams.index'), { search: searchTerm }, { preserveState: true });
    };

    const deleteTeam = (team) => {
        if (confirm(`Voulez-vous vraiment supprimer l'équipe "${team.name}" ?`)) {
            router.delete(route('admin.teams.destroy', team.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Équipes - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Équipes</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestion des équipes de la plateforme
                            </p>
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
                                placeholder="Rechercher une équipe..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-tasho-primary focus:border-tasho-primary"
                            />
                        </form>
                    </div>

                    {/* Teams Grid */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.data && teams.data.length > 0 ? (
                            teams.data.map((team) => (
                                <div key={team.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                    <UserGroupIcon className="h-6 w-6 text-tasho-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {team.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {team.owner?.name || 'Aucun propriétaire'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                team.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {team.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {team.members_count || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">Membres</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {team.projects_count || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">Projets</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {team.files_count || 0}
                                                </p>
                                                <p className="text-xs text-gray-500">Fichiers</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                {new Date(team.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={route('admin.teams.show', team.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                                                    title="Voir"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteTeam(team)}
                                                    className="p-2 text-red-400 hover:text-red-600 transition"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-gray-100 p-6">
                                        <UserGroupIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <p className="mt-4 text-gray-500">Aucune équipe trouvée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}