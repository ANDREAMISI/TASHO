import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    UserIcon,
    UsersIcon,
    CreditCardIcon,
    CalendarIcon,
    ClockIcon,
    CheckIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
} from '@/Components/Icons';

export default function SubscriptionsShow({ auth, subscription }) {
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        expired: 'bg-red-100 text-red-800',
        cancelled: 'bg-yellow-100 text-yellow-800',
    };

    const statusLabels = {
        active: 'Actif',
        inactive: 'Inactif',
        expired: 'Expiré',
        cancelled: 'Annulé',
    };

    const toggleSubscription = () => {
        if (confirm(`Voulez-vous ${subscription.status === 'active' ? 'désactiver' : 'activer'} cet abonnement ?`)) {
            router.post(route('admin.subscriptions.toggle', subscription.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const deleteSubscription = () => {
        if (confirm(`Voulez-vous vraiment supprimer cet abonnement ?`)) {
            router.delete(route('admin.subscriptions.destroy', subscription.id), {
                onSuccess: () => router.visit(route('admin.subscriptions.index')),
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAmount = (amount) => {
        if (amount === 0) return 'Gratuit';
        return new Intl.NumberFormat('fr-BI', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Abonnement ${subscription.id} - Administration`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.subscriptions.index')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Abonnement #{subscription.id}
                                </h1>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                                        {statusLabels[subscription.status]}
                                    </span>
                                    {subscription.is_expired && (
                                        <span className="text-xs text-red-500 font-medium">(Expiré)</span>
                                    )}
                                    {subscription.is_expiring_soon && !subscription.is_expired && (
                                        <span className="text-xs text-yellow-500 font-medium">(Expire bientôt)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link
                                href={route('admin.subscriptions.edit', subscription.id)}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                            </Link>
                            <button
                                onClick={toggleSubscription}
                                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${
                                    subscription.status === 'active'
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                            >
                                {subscription.status === 'active' ? (
                                    <>
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        Désactiver
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Activer
                                    </>
                                )}
                            </button>
                            <button
                                onClick={deleteSubscription}
                                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Supprimer
                            </button>
                        </div>
                    </div>

                    {/* Informations principales */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Utilisateur */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <UserIcon className="h-4 w-4 inline mr-1" />
                                Utilisateur
                            </h3>
                            {subscription.user ? (
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <span className="font-bold text-tasho-primary text-lg">
                                            {subscription.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{subscription.user.name}</p>
                                        <p className="text-sm text-gray-500">{subscription.user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">Utilisateur non trouvé</p>
                            )}
                        </div>

                        {/* Équipe */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <UsersIcon className="h-4 w-4 inline mr-1" />
                                Équipe
                            </h3>
                            {subscription.team ? (
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <UsersIcon className="h-6 w-6 text-tasho-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{subscription.team.name}</p>
                                        <p className="text-sm text-gray-500">ID: #{subscription.team.id}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">Équipe non trouvée</p>
                            )}
                        </div>
                    </div>

                    {/* Plan et Montant */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plan */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <CreditCardIcon className="h-4 w-4 inline mr-1" />
                                Plan
                            </h3>
                            {subscription.plan ? (
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{subscription.plan.name}</p>
                                    <p className="text-sm text-gray-500">{subscription.plan.slug}</p>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <span className="text-sm font-medium text-tasho-primary">
                                            {formatAmount(subscription.amount)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            / {subscription.billing_cycle}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">Plan non trouvé</p>
                            )}
                        </div>

                        {/* Montant */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                                Montant
                            </h3>
                            <div>
                                <p className="text-2xl font-bold text-tasho-primary">
                                    {formatAmount(subscription.amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Cycle: {subscription.billing_cycle}
                                </p>
                                {subscription.payment_method && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Paiement: {subscription.payment_method}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Période */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dates */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <CalendarIcon className="h-4 w-4 inline mr-1" />
                                Période
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date de début</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(subscription.start_date)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date de fin</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(subscription.end_date) || '—'}
                                    </span>
                                </div>
                                {subscription.days_remaining !== null && (
                                    <div className="flex justify-between pt-2 border-t border-gray-100">
                                        <span className="text-gray-500">Jours restants</span>
                                        <span className={`font-medium ${
                                            subscription.days_remaining > 7 
                                                ? 'text-green-600' 
                                                : subscription.days_remaining > 0 
                                                    ? 'text-yellow-600' 
                                                    : 'text-red-600'
                                        }`}>
                                            {subscription.days_remaining > 0 
                                                ? subscription.days_remaining + ' jours' 
                                                : 'Expiré'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Paiements */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                <ClockIcon className="h-4 w-4 inline mr-1" />
                                Paiements
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Dernier paiement</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDateTime(subscription.last_payment_at) || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Prochain paiement</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDateTime(subscription.next_payment_at) || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {subscription.notes && (
                        <div className="mt-6">
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-4">
                                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                                    Notes
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{subscription.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Informations système */}
                    <div className="mt-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Informations système</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">ID</span>
                                    <p className="font-medium text-gray-900">#{subscription.id}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Créé le</span>
                                    <p className="font-medium text-gray-900">
                                        {formatDateTime(subscription.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Dernière mise à jour</span>
                                    <p className="font-medium text-gray-900">
                                        {formatDateTime(subscription.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between">
                        <Link
                            href={route('admin.subscriptions.index')}
                            className="text-gray-500 hover:text-gray-700 transition flex items-center"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour à la liste
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.subscriptions.edit', subscription.id)}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}