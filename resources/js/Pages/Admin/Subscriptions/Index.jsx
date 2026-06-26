import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon,
    FilterIcon,
    ArrowPathIcon,
} from '@/Components/Icons';

export default function SubscriptionsIndex({ auth, subscriptions, filters, plans, statuses }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        expired: 'bg-red-100 text-red-800',
        cancelled: 'bg-yellow-100 text-yellow-800',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const applyFilters = (newFilters) => {
        router.get(route('admin.subscriptions.index'), {
            ...filters,
            ...newFilters,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm('');
        router.get(route('admin.subscriptions.index'), {}, { preserveState: true });
    };

    const toggleSubscription = (subscription) => {
        if (confirm(`Voulez-vous ${subscription.status === 'active' ? 'désactiver' : 'activer'} cet abonnement ?`)) {
            router.post(route('admin.subscriptions.toggle', subscription.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const deleteSubscription = (subscription) => {
        if (confirm(`Voulez-vous vraiment supprimer l'abonnement de ${subscription.user?.name} ?`)) {
            router.delete(route('admin.subscriptions.destroy', subscription.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Abonnements - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Abonnements</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestion des abonnements de la plateforme
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <Link
                                href={route('admin.subscriptions.create')}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nouvel abonnement
                            </Link>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Filtres
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => applyFilters({ status: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Tous</option>
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Plan
                                    </label>
                                    <select
                                        value={filters.plan_id || ''}
                                        onChange={(e) => applyFilters({ plan_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Tous</option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {(filters.status || filters.plan_id) && (
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
                                placeholder="Rechercher par utilisateur ou équipe..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-tasho-primary focus:border-tasho-primary"
                            />
                        </form>
                    </div>

                    {/* Table */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Utilisateur / Équipe
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Période
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {subscriptions.data && subscriptions.data.length > 0 ? (
                                        subscriptions.data.map((subscription) => (
                                            <tr key={subscription.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {subscription.user?.name || '—'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {subscription.user?.email || ''}
                                                        </p>
                                                        {subscription.team && (
                                                            <p className="text-xs text-gray-400">
                                                                Équipe: {subscription.team.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tasho-primary/10 text-tasho-primary">
                                                        {subscription.plan?.name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                                                        {subscription.status_label}
                                                    </span>
                                                    {subscription.is_expired && (
                                                        <span className="ml-2 text-xs text-red-500">(Expiré)</span>
                                                    )}
                                                    {subscription.is_expiring_soon && !subscription.is_expired && (
                                                        <span className="ml-2 text-xs text-yellow-500">(Expire bientôt)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {subscription.amount} €
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        / {subscription.billing_cycle}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    {subscription.end_date && (
                                                        <div className="text-xs text-gray-400">
                                                            → {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={route('admin.subscriptions.show', subscription.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition"
                                                            title="Voir"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('admin.subscriptions.edit', subscription.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition"
                                                            title="Modifier"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleSubscription(subscription)}
                                                            className={`transition ${
                                                                subscription.status === 'active'
                                                                    ? 'text-yellow-400 hover:text-yellow-600'
                                                                    : 'text-green-400 hover:text-green-600'
                                                            }`}
                                                            title={subscription.status === 'active' ? 'Désactiver' : 'Activer'}
                                                        >
                                                            {subscription.status === 'active' ? (
                                                                <XMarkIcon className="h-4 w-4" />
                                                            ) : (
                                                                <CheckIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSubscription(subscription)}
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
                                                <p className="text-gray-500">Aucun abonnement trouvé</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {subscriptions.links && subscriptions.links.length > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Affichage de {subscriptions.from || 0} à {subscriptions.to || 0} sur {subscriptions.total || 0}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        {subscriptions.links.map((link, index) => (
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
        </AdminLayout>
    );
}