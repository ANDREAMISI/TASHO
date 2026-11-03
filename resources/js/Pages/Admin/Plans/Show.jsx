import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    PencilIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    FolderIcon,
    UsersIcon,
    BoltIcon,
    CalendarIcon,
} from '@/Components/Icons';

function formatPrice(amount, currency) {
    if (Number(amount) === 0) return 'Gratuit';

    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(amount))} ${currency || 'FBU'}`;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatFeature(value) {
    if (typeof value === 'boolean') return value ? 'Inclus' : 'Non inclus';
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export default function PlansShow({ auth, plan }) {
    return (
        <AdminLayout user={auth.user}>
            <Head title={`${plan.name} - Plan`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.plans.index')}
                                className="rounded-md p-2 text-gray-400 transition hover:text-gray-600"
                                aria-label="Retour aux plans"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {plan.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{plan.description || plan.slug}</p>
                            </div>
                        </div>
                        <Link
                            href={route('admin.plans.edit', plan.id)}
                            className="inline-flex items-center rounded-md bg-tasho-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-tasho-primary/90"
                        >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Modifier le plan
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <section className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-2 font-semibold text-gray-900">
                                <CurrencyDollarIcon className="h-5 w-5 text-tasho-primary" />
                                Tarification
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Mensuel</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {formatPrice(plan.price_monthly, plan.currency)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Annuel</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {formatPrice(plan.price_yearly, plan.currency)}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-500">
                                Devise : <span className="font-medium text-gray-800">{plan.currency || 'FBU'}</span>
                            </p>
                        </section>

                        <section className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-5 flex items-center gap-2 font-semibold text-gray-900">
                                <CreditCardIcon className="h-5 w-5 text-tasho-primary" />
                                Limites du plan
                            </h2>
                            <dl className="space-y-4 text-sm">
                                <Limit icon={FolderIcon} label="Stockage" value={plan.storage_human} />
                                <Limit
                                    icon={UsersIcon}
                                    label="Membres maximum"
                                    value={plan.max_team_members === -1 ? 'Illimité' : plan.max_team_members}
                                />
                                <Limit
                                    icon={BoltIcon}
                                    label="Projets maximum"
                                    value={plan.max_projects === -1 ? 'Illimité' : plan.max_projects}
                                />
                                <Limit icon={CreditCardIcon} label="Taille maximale par fichier" value={plan.max_file_size_human} />
                                <Limit icon={CreditCardIcon} label="Abonnements associés" value={plan.subscriptions_count} />
                            </dl>
                        </section>
                    </div>

                    <section className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-gray-900">Fonctionnalités</h2>
                        {plan.features && Object.keys(plan.features).length > 0 ? (
                            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(plan.features).map(([name, value]) => (
                                    <div key={name} className="rounded-md bg-gray-50 px-4 py-3">
                                        <dt className="text-sm text-gray-500">{name.replaceAll('_', ' ')}</dt>
                                        <dd className="mt-1 text-sm font-medium text-gray-900">{formatFeature(value)}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-500">Aucune fonctionnalité détaillée pour ce plan.</p>
                        )}
                    </section>

                    <section className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h2 className="font-semibold text-gray-900">Abonnements récents</h2>
                            <span className="text-sm text-gray-500">{plan.subscriptions_count} au total</span>
                        </div>
                        {plan.subscriptions?.length ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Utilisateur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Cycle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Montant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Fin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {plan.subscriptions.map((subscription) => (
                                            <tr key={subscription.id}>
                                                <td className="px-6 py-4 text-sm">
                                                    <p className="font-medium text-gray-900">{subscription.user?.name || 'Utilisateur supprimé'}</p>
                                                    <p className="text-gray-500">{subscription.user?.email || ''}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{subscription.status}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {subscription.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {formatPrice(subscription.amount, subscription.currency)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                        {formatDate(subscription.end_date)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="px-6 py-8 text-center text-sm text-gray-500">Aucun abonnement lié à ce plan.</p>
                        )}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}

function Limit({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-gray-500">
                <Icon className="h-4 w-4" />
                {label}
            </dt>
            <dd className="font-medium text-gray-900">{value ?? '—'}</dd>
        </div>
    );
}
