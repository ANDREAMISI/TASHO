import { Head, useForm } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import Button from '@/Components/Button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Cog6ToothIcon,
    CreditCardIcon,
    EnvelopeIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
} from '@/Components/Icons';

const LANDING_OPTIONS = [
    { value: 'dashboard', label: 'Tableau de bord' },
    { value: 'projects', label: 'Projets' },
];

const FILES_SORT_OPTIONS = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'name', label: 'Nom (A → Z)' },
    { value: 'size', label: 'Taille (du plus lourd)' },
];

/**
 * Une ligne de préférence : libellé + description à gauche, contrôle à droite.
 */
function PreferenceRow({ icon: Icon, title, description, children }) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
            </div>

            <div className="sm:shrink-0 sm:pl-6">{children}</div>
        </div>
    );
}

export default function SettingsIndex({ user, team = null, preferences = {} }) {
    const form = useForm({
        default_landing: preferences.default_landing ?? 'dashboard',
        files_sort: preferences.files_sort ?? 'recent',
        show_plan_card: preferences.show_plan_card !== false,
        sidebar_open: preferences.sidebar_open !== false,
    });

    const initials = user?.initials || (user?.name || 'U').charAt(0).toUpperCase();

    const submit = (event) => {
        event.preventDefault();

        form.put(route('settings.update-preferences'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Paramètres - TASHO" />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* En-tête */}
                <header className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tasho-primary/10 text-tasho-primary">
                        <Cog6ToothIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Paramètres
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Personnalisez votre espace de travail. Ces préférences sont propres à
                            votre compte.
                        </p>
                    </div>
                </header>

                {/* Compte + équipe */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar
                                image={user?.avatar_url || undefined}
                                label={user?.avatar_url ? undefined : initials}
                                imageAlt={user?.name}
                                shape="circle"
                                className="!h-11 !w-11 !bg-tasho-primary !text-sm !font-semibold !text-white"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {user?.name || 'Utilisateur'}
                                </p>
                                <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                                    <EnvelopeIcon className="h-3 w-3 shrink-0" />
                                    {user?.email || ''}
                                </p>
                            </div>
                        </div>

                        <Button
                            href={route('profile.edit')}
                            variant="secondary"
                            className="mt-4 w-full justify-center"
                        >
                            <i className="pi pi-user text-xs" />
                            Modifier mon profil
                        </Button>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <UsersIcon className="h-5 w-5" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {team?.name || 'Aucune équipe'}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {team
                                        ? `${team.members_count} membre${
                                              team.members_count > 1 ? 's' : ''
                                          }${team.is_owner ? ' · Vous êtes propriétaire' : ''}`
                                        : 'Créez une équipe pour collaborer'}
                                </p>
                            </div>
                        </div>

                        <Button
                            href={team ? route('team.index') : route('team.index', { create: 1 })}
                            variant="secondary"
                            className="mt-4 w-full justify-center"
                        >
                            <i className="pi pi-users text-xs" />
                            {team ? "Gérer l'équipe" : 'Créer une équipe'}
                        </Button>
                    </section>
                </div>

                {/* Préférences générales */}
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Préférences générales
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Ces réglages s'appliquent dès votre prochaine navigation.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100 px-5">
                        <PreferenceRow
                            icon={HomeIcon}
                            title="Page d'accueil"
                            description="Page affichée après votre connexion."
                        >
                            <Dropdown
                                inputId="default-landing"
                                value={form.data.default_landing}
                                options={LANDING_OPTIONS}
                                onChange={(event) =>
                                    form.setData('default_landing', event.value)
                                }
                                className="w-full sm:w-56"
                                aria-label="Page d'accueil"
                            />
                        </PreferenceRow>

                        <PreferenceRow
                            icon={FolderIcon}
                            title="Tri des fichiers"
                            description="Ordre appliqué par défaut dans l'onglet Fichiers d'un projet."
                        >
                            <Dropdown
                                inputId="files-sort"
                                value={form.data.files_sort}
                                options={FILES_SORT_OPTIONS}
                                onChange={(event) => form.setData('files_sort', event.value)}
                                className="w-full sm:w-56"
                                aria-label="Tri des fichiers"
                            />
                        </PreferenceRow>

                        <PreferenceRow
                            icon={CreditCardIcon}
                            title="Carte de l'abonnement"
                            description="Afficher le plan et le stockage utilisé dans la barre latérale."
                        >
                            <div className="flex items-center gap-2 sm:justify-end">
                                <InputSwitch
                                    inputId="show-plan-card"
                                    checked={form.data.show_plan_card}
                                    onChange={(event) =>
                                        form.setData('show_plan_card', event.value)
                                    }
                                />
                                <label
                                    htmlFor="show-plan-card"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    {form.data.show_plan_card ? 'Affichée' : 'Masquée'}
                                </label>
                            </div>
                        </PreferenceRow>

                        <PreferenceRow
                            icon={Cog6ToothIcon}
                            title="Barre latérale ouverte"
                            description="État par défaut du menu sur grand écran."
                        >
                            <div className="flex items-center gap-2 sm:justify-end">
                                <InputSwitch
                                    inputId="sidebar-open"
                                    checked={form.data.sidebar_open}
                                    onChange={(event) =>
                                        form.setData('sidebar_open', event.value)
                                    }
                                />
                                <label
                                    htmlFor="sidebar-open"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    {form.data.sidebar_open ? 'Ouverte' : 'Fermée'}
                                </label>
                            </div>
                        </PreferenceRow>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/70 px-5 py-3.5">
                        <p className="text-xs text-gray-500">
                            {form.isDirty
                                ? 'Modifications non enregistrées.'
                                : 'Vos préférences sont à jour.'}
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                label="Annuler"
                                icon="pi pi-times"
                                severity="secondary"
                                text
                                onClick={() => form.reset()}
                                disabled={!form.isDirty || form.processing}
                            />
                            <Button
                                type="submit"
                                label={form.processing ? 'Enregistrement…' : 'Enregistrer'}
                                icon="pi pi-check"
                                loading={form.processing}
                                disabled={!form.isDirty || form.processing}
                                className="!bg-tasho-primary !border-tasho-primary"
                            />
                        </div>
                    </div>
                </form>

                <p className="px-1 text-xs text-gray-400">
                    Astuce : retrouvez vos informations personnelles, votre photo et votre mot de
                    passe dans votre profil.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
