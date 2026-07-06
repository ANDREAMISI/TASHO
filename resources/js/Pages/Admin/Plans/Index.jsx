import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    BoltIcon,
    UsersIcon,
    FolderIcon,
} from '@/Components/Icons';

export default function PlansIndex({ auth, plans }) {
    const [showDeleted, setShowDeleted] = useState(false);

    const togglePlan = (plan) => {
        if (confirm(`Voulez-vous ${plan.is_active ? 'désactiver' : 'activer'} le plan "${plan.name}" ?`)) {
            router.post(route('admin.plans.toggle', plan.id), {}, { preserveScroll: true });
        }
    };

    const deletePlan = (plan) => {
        if (confirm(`Voulez-vous vraiment supprimer le plan "${plan.name}" ?`)) {
            router.delete(route('admin.plans.destroy', plan.id), {
                preserveScroll: true,
            });
        }
    };

    const formatPrice = (price) => {
        return price === 0 ? 'Gratuit' : price + ' €';
    };

    const formatStorage = (bytes) => {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Plans - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Plans</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gestion des plans d'abonnement
                            </p>
                        </div>
                        <Link
                            href={route('admin.plans.create')}
                            className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau plan
                        </Link>
                    </div>

                    {/* Plans Grid */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans && plans.length > 0 ? (
                            plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition ${
                                        !plan.is_active ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {plan.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {plan.description || 'Aucune description'}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                plan.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {plan.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-end justify-between">
                                            <div>
                                                <p className="text-3xl font-bold text-tasho-primary">
                                                    {formatPrice(plan.price_monthly)}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {plan.price_yearly > 0 ? formatPrice(plan.price_yearly) + '/an' : ''}
                                                </p>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {plan.price_yearly > 0 && plan.price_yearly < plan.price_monthly * 12 ? (
                                                    <span className="text-green-600 font-medium">
                                                        -{Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                                                    </span>
                                                ) : null}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <FolderIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {formatStorage(plan.storage_limit)}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {plan.max_team_members === -1 ? 'Illimité' : plan.max_team_members} membres
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <BoltIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {plan.max_projects === -1 ? 'Illimité' : plan.max_projects} projets
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <CreditCardIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {formatStorage(plan.max_file_size)} par fichier
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                                            <Link
                                                href={route('admin.plans.show', plan.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                                                title="Voir"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={route('admin.plans.edit', plan.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                                                title="Modifier"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => togglePlan(plan)}
                                                className={`p-2 transition ${
                                                    plan.is_active
                                                        ? 'text-yellow-400 hover:text-yellow-600'
                                                        : 'text-green-400 hover:text-green-600'
                                                }`}
                                                title={plan.is_active ? 'Désactiver' : 'Activer'}
                                            >
                                                {plan.is_active ? (
                                                    <XMarkIcon className="h-4 w-4" />
                                                ) : (
                                                    <CheckIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deletePlan(plan)}
                                                className="p-2 text-red-400 hover:text-red-600 transition"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-gray-100 p-6">
                                        <CreditCardIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <p className="mt-4 text-gray-500">Aucun plan configuré</p>
                                <div className="mt-4">
                                    <Link
                                        href={route('admin.plans.create')}
                                        className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Créer un plan
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}