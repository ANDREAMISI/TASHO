import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    FilterIcon,
} from '@/Components/Icons';

export default function UsersIndex({ auth, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search: searchTerm }, { preserveState: true });
    };

    const toggleUser = (user) => {
        if (confirm(`Voulez-vous ${user.is_active ? 'désactiver' : 'activer'} l'utilisateur ${user.name} ?`)) {
            router.post(route('admin.users.toggle', user.id), {}, { preserveScroll: true });
        }
    };

    const deleteUser = (user) => {
        if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Utilisateurs - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestion des utilisateurs de la plateforme
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
                                placeholder="Rechercher un utilisateur..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-tasho-primary focus:border-tasho-primary"
                            />
                        </form>
                    </div>

                    {/* Users Table */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Utilisateur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Profession
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inscrit le
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                            <span className="font-medium text-tasho-primary">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.profession || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('admin.users.show', user.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition"
                                                            title="Voir"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleUser(user)}
                                                            className={`transition ${
                                                                user.is_active
                                                                    ? 'text-yellow-400 hover:text-yellow-600'
                                                                    : 'text-green-400 hover:text-green-600'
                                                            }`}
                                                            title={user.is_active ? 'Désactiver' : 'Activer'}
                                                        >
                                                            {user.is_active ? (
                                                                <XMarkIcon className="h-4 w-4" />
                                                            ) : (
                                                                <CheckIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user)}
                                                            className="text-red-400 hover:text-red-600 transition"
                                                            title="Supprimer"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <p className="text-gray-500">Aucun utilisateur trouvé</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center space-x-1">
                                {users.links.map((link, index) => (
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
        </AdminLayout>
    );
}