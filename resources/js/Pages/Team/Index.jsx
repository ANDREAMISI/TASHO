import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import {
    PlusIcon,
    UsersIcon,
    UserGroupIcon,
    ArrowRightIcon,
} from '@/Components/Icons';

export default function TeamIndex({ auth, teams, currentTeam, openCreate = false }) {
    const [createOpen, setCreateOpen] = useState(Boolean(openCreate));

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (openCreate) {
            setCreateOpen(true);
        }
    }, [openCreate]);

    const close = () => {
        if (processing) {
            return;
        }

        setCreateOpen(false);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        post(route('team.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Équipes - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Équipes</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez vos équipes et collaborateurs
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Créer une équipe
                        </button>
                    </div>

                    {/* Current Team */}
                    {currentTeam && (
                        <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {currentTeam.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {currentTeam.members_count || 1} membres
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('team.show', currentTeam)}
                                    className="inline-flex items-center text-tasho-primary hover:text-tasho-primary/80 font-medium"
                                >
                                    Gérer l'équipe
                                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* All Teams */}
                    {teams.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Toutes vos équipes
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.map((team) => (
                                    <Link
                                        key={team.id}
                                        href={route('team.show', team)}
                                        className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-tasho-primary/20"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                                <UsersIcon className="h-6 w-6 text-tasho-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {team.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Propriétaire : {team.owner?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {teams.length === 0 && !currentTeam && (
                        <div className="mt-12 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <UsersIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Aucune équipe
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Commencez par créer votre première équipe
                            </p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Créer une équipe
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FormDialog
                visible={createOpen}
                onHide={close}
                title="Créer une équipe"
                description="Un espace partagé pour vos projets et vos clients."
                icon="pi pi-users"
                formId="team-form"
                onSubmit={submit}
                submitLabel={processing ? 'Création…' : 'Créer l’équipe'}
                processing={processing}
                width="34rem"
                closable={!processing}
            >
                <form id="team-form" onSubmit={submit} className="space-y-5">
                    <FormField
                        label="Nom de l'équipe"
                        htmlFor="team-name"
                        required
                        error={errors.name}
                    >
                        <InputText
                            id="team-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="Ex : Studio Amisi"
                            className={errors.name ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="team-description"
                        error={errors.description}
                        hint="Facultatif — aidez vos collaborateurs à identifier l'équipe."
                    >
                        <InputTextarea
                            id="team-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={3}
                            autoResize
                            maxLength={500}
                            placeholder="Ex : Équipe photo et vidéo"
                            className={errors.description ? 'p-invalid' : ''}
                        />
                    </FormField>
                </form>
            </FormDialog>
        </AuthenticatedLayout>
    );
}
