import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import PlanFormModal from '@/Components/Admin/PlanFormModal';
import {
    ArrowLeftIcon,
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

export default function PlansShow({ auth, plan }) {
    const [formOpen, setFormOpen] = useState(false);

    const togglePlan = () => {
        confirmDialog({
            message: `Voulez-vous ${plan.is_active ? 'désactiver' : 'activer'} le plan "${plan.name}" ?`,
            header: plan.is_active ? 'Désactiver le plan' : 'Activer le plan',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: plan.is_active ? 'Désactiver' : 'Activer',
            rejectLabel: 'Annuler',
            accept: () =>
                router.post(route('admin.plans.toggle', plan.id), {}, { preserveScroll: true }),
        });
    };

    const deletePlan = () => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer le plan "${plan.name}" ?`,
            header: 'Supprimer le plan',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('admin.plans.destroy', plan.id), {
                    onSuccess: () => router.visit(route('admin.plans.index')),
                }),
        });
    };

    const limits = [
        { icon: FolderIcon, label: 'Stockage', value: plan.storage_human },
        {
            icon: UsersIcon,
            label: 'Membres',
            value: plan.max_team_members === -1 ? 'Illimité' : plan.max_team_members,
        },
        {
            icon: BoltIcon,
            label: 'Projets',
            value: plan.max_projects === -1 ? 'Illimité' : plan.max_projects,
        },
        { icon: CreditCardIcon, label: 'Taille max. par fichier', value: plan.max_file_size_human },
    ];

    const booleanFeatures = (plan.public_features || []).filter(
        (feature) => typeof feature.value === 'boolean',
    );

    return (
        <>
            <Head title={`${plan.name} - Administration`} />

            <ConfirmDialog />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.plans.index')}
                                className="p-2 text-gray-400 transition hover:text-gray-600"
                                title="Retour"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
                                <p className="text-sm text-gray-500">{plan.description || 'Aucune description'}</p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    plan.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {plan.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setFormOpen(true)}
                                className="inline-flex items-center rounded-md bg-tasho-primary px-4 py-2 font-medium text-white transition hover:bg-tasho-primary/90"
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Modifier
                            </button>
                            <button
                                onClick={togglePlan}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                {plan.is_active ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                                onClick={deletePlan}
                                className="inline-flex items-center rounded-md border border-red-200 bg-white px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Supprimer
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="mr-2 h-4 w-4" />
                                Prix mensuel
                            </div>
                            <p className="mt-2 text-2xl font-bold text-tasho-primary">
                                {plan.price_monthly_formatted}
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="mr-2 h-4 w-4" />
                                Prix annuel
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {plan.price_yearly_formatted}
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center text-sm text-gray-500">
                                <BoltIcon className="mr-2 h-4 w-4" />
                                Ordre d'affichage
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{plan.sort_order}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900">Limites</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {limits.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                                    >
                                        <span className="flex items-center text-sm text-gray-600">
                                            <Icon className="mr-2 h-4 w-4 text-gray-400" />
                                            {item.label}
                                        </span>
                                        <span className="font-medium text-gray-900">{item.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900">Fonctionnalités</h2>
                        {booleanFeatures.length > 0 ? (
                            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {booleanFeatures.map((feature) => (
                                    <li
                                        key={feature.name}
                                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm"
                                    >
                                        <span className="text-gray-600">{feature.name}</span>
                                        {feature.value ? (
                                            <CheckIcon className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XMarkIcon className="h-5 w-5 text-gray-300" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">
                                Aucune fonctionnalité spécifique n'est configurée.
                            </p>
                        )}
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        Créé le {new Date(plan.created_at).toLocaleDateString('fr-FR')} · Identifiant :{' '}
                        <code className="rounded bg-gray-100 px-1.5 py-0.5">{plan.slug}</code>
                    </div>
                </div>
            </div>

            <PlanFormModal
                visible={formOpen}
                onHide={() => setFormOpen(false)}
                plan={plan}
            />
        </>
    );
}

PlansShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
