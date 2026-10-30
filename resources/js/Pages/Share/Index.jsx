import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import {
    CopyIcon,
    CheckIcon,
    MessageSquare,
    ShieldCheckIcon,
    EyeIcon,
    DownloadIcon,
    HeartIcon,
    LinkIcon,
    PlusIcon,
} from '@/Components/Icons';

const PERMISSIONS = [
    {
        key: 'is_public',
        label: 'Accès public',
        hint: 'Toute personne disposant du lien peut ouvrir la galerie.',
        icon: EyeIcon,
    },
    {
        key: 'can_download',
        label: 'Téléchargement',
        hint: 'Autoriser le téléchargement des fichiers.',
        icon: DownloadIcon,
    },
    {
        key: 'can_comment',
        label: 'Commentaires',
        hint: 'Permettre au client de laisser un avis.',
        icon: MessageSquare,
    },
    {
        key: 'can_favorite',
        label: 'Favoris',
        hint: 'Permettre au client de sélectionner ses favoris.',
        icon: HeartIcon,
    },
];

export default function ShareIndex({ auth, projects, selectedProject, accesses = [], team }) {
    const [copiedId, setCopiedId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        client_name: '',
        client_email: '',
        is_public: true,
        can_download: true,
        can_comment: true,
        can_favorite: true,
        expires_in_days: 30,
        max_views: null,
        password: '',
    });

    const projectOptions = projects.map((project) => ({
        value: project.id,
        label: project.title,
    }));

    const handleProjectChange = (projectId) => {
        router.get(
            route('shares.index'),
            projectId ? { project_id: projectId } : {},
            { preserveScroll: true },
        );
    };

    const copyLink = async (shareUrl, accessId) => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedId(accessId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Impossible de copier le lien :', error);
        }
    };

    const shareOnWhatsApp = (shareUrl) => {
        const projectTitle = selectedProject?.title || 'Galerie TASHO';
        const message = `Bonjour, voici la galerie du projet ${projectTitle} : ${shareUrl}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const openForm = () => {
        clearErrors();
        setFormOpen(true);
    };

    const closeForm = () => {
        if (processing) {
            return;
        }

        setFormOpen(false);
        reset();
        clearErrors();
    };

    const submitShare = (event) => {
        event.preventDefault();

        if (!selectedProject) {
            return;
        }

        post(route('shares.share', selectedProject.id), {
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                reset();
            },
        });
    };

    const revokeAccess = (access) => {
        confirmDialog({
            message: 'Voulez-vous vraiment révoquer ce lien de partage ? Le client perdra immédiatement l’accès.',
            header: 'Révoquer le partage',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Révoquer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('shares.revoke', access.id), {
                    preserveScroll: true,
                }),
        });
    };

    const accessCount = accesses.length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Partages - TASHO" />

            <ConfirmDialog />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Partages
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Créez des liens de galerie sécurisés pour les clients de{' '}
                            <span className="font-medium text-gray-700">{team?.name}</span>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            label="Nouveau partage"
                            icon="pi pi-plus"
                            onClick={openForm}
                            disabled={!selectedProject}
                            className="!bg-tasho-primary !border-tasho-primary"
                        />
                    </div>
                </header>

                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <FormField label="Projet" htmlFor="share-project" className="flex-1">
                            <Dropdown
                                inputId="share-project"
                                value={selectedProject?.id || null}
                                options={projectOptions}
                                onChange={(event) => handleProjectChange(event.value)}
                                placeholder="Sélectionnez un projet"
                                filter
                                emptyMessage="Aucun projet partageable"
                            />
                        </FormField>

                        <Button
                            type="button"
                            label="Créer un lien"
                            icon="pi pi-link"
                            onClick={openForm}
                            disabled={!selectedProject}
                            className="!bg-tasho-primary !border-tasho-primary"
                        />
                    </div>

                    {projectOptions.length === 0 && (
                        <p className="mt-3 text-xs text-gray-500">
                            Aucun projet actif ou terminé. Créez un projet pour pouvoir partager une
                            galerie.
                        </p>
                    )}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <ShieldCheckIcon className="h-5 w-5 text-tasho-primary" />
                            Liens actifs
                        </div>
                        <span className="text-xs text-gray-500">
                            {accessCount} {accessCount > 1 ? 'liens' : 'lien'}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {accessCount > 0 ? (
                            accesses.map((access) => (
                                <div key={access.id} className="px-5 py-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {access.client?.name || 'Invité'}
                                            </p>
                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {access.share_url}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="whitespace-nowrap text-xs text-gray-500">
                                                {access.view_count || 0}{' '}
                                                {(access.view_count || 0) > 1 ? 'vues' : 'vue'}
                                            </span>
                                            <Button
                                                type="button"
                                                icon="pi pi-trash"
                                                rounded
                                                text
                                                severity="danger"
                                                onClick={() => revokeAccess(access)}
                                                tooltip="Révoquer"
                                                tooltipOptions={{ position: 'left' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copyLink(access.share_url, access.id)}
                                            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                        >
                                            {copiedId === access.id ? (
                                                <>
                                                    <CheckIcon className="mr-1 h-3.5 w-3.5 text-green-500" />
                                                    Copié
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon className="mr-1 h-3.5 w-3.5" />
                                                    Copier
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => shareOnWhatsApp(access.share_url)}
                                            className="inline-flex items-center rounded-md bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600"
                                        >
                                            <MessageSquare className="mr-1 h-3.5 w-3.5" />
                                            WhatsApp
                                        </button>

                                        <div className="ml-auto flex flex-wrap gap-3 text-[11px] text-gray-500">
                                            {access.is_public && (
                                                <span className="inline-flex items-center gap-1">
                                                    <EyeIcon className="h-3 w-3" /> public
                                                </span>
                                            )}
                                            {access.can_download && (
                                                <span className="inline-flex items-center gap-1">
                                                    <DownloadIcon className="h-3 w-3" /> téléchargement
                                                </span>
                                            )}
                                            {access.can_comment && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" /> commentaires
                                                </span>
                                            )}
                                            {access.can_favorite && (
                                                <span className="inline-flex items-center gap-1">
                                                    <HeartIcon className="h-3 w-3" /> favoris
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-12 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                    <LinkIcon className="h-6 w-6" />
                                </span>
                                <p className="mt-3 text-sm font-medium text-gray-900">
                                    {selectedProject
                                        ? 'Aucun partage actif pour ce projet'
                                        : 'Sélectionnez un projet'}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {selectedProject
                                        ? 'Créez un lien pour donner accès à la galerie.'
                                        : 'Choisissez un projet pour voir et créer ses liens de partage.'}
                                </p>
                                {selectedProject && (
                                    <button
                                        type="button"
                                        onClick={openForm}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Créer un partage
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <FormDialog
                visible={formOpen}
                onHide={closeForm}
                title="Nouveau partage"
                description={
                    selectedProject
                        ? `Galerie « ${selectedProject.title} »`
                        : 'Sélectionnez d’abord un projet.'
                }
                icon="pi pi-link"
                formId="share-form"
                onSubmit={submitShare}
                submitLabel={processing ? 'Création…' : 'Créer le lien'}
                submitIcon="pi pi-link"
                processing={processing}
                submitDisabled={!selectedProject}
                width="40rem"
                closable={!processing}
            >
                <form id="share-form" onSubmit={submitShare} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            label="Nom du client"
                            htmlFor="share-client-name"
                            error={errors.client_name}
                        >
                            <InputText
                                id="share-client-name"
                                value={data.client_name}
                                onChange={(event) =>
                                    setData('client_name', event.target.value)
                                }
                                placeholder="Ex : Sarah Dupont"
                                className={errors.client_name ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Email du client"
                            htmlFor="share-client-email"
                            error={errors.client_email}
                            hint="Un client sera créé s’il n’existe pas."
                        >
                            <InputText
                                id="share-client-email"
                                type="email"
                                value={data.client_email}
                                onChange={(event) =>
                                    setData('client_email', event.target.value)
                                }
                                placeholder="client@exemple.com"
                                className={errors.client_email ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Durée du lien"
                            htmlFor="share-expires"
                            error={errors.expires_in_days}
                            hint="Entre 1 et 365 jours."
                        >
                            <InputNumber
                                inputId="share-expires"
                                value={data.expires_in_days}
                                onValueChange={(event) =>
                                    setData('expires_in_days', event.value)
                                }
                                min={1}
                                max={365}
                                suffix=" jours"
                                showButtons
                                buttonLayout="horizontal"
                                decrementButtonClassName="p-button-secondary"
                                incrementButtonClassName="p-button-secondary"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                className={errors.expires_in_days ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Nombre max de vues"
                            htmlFor="share-max-views"
                            error={errors.max_views}
                            hint="Laissez vide pour illimité."
                        >
                            <InputNumber
                                inputId="share-max-views"
                                value={data.max_views}
                                onValueChange={(event) => setData('max_views', event.value)}
                                min={1}
                                placeholder="Illimité"
                                className={errors.max_views ? 'p-invalid' : ''}
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Mot de passe"
                        htmlFor="share-password"
                        error={errors.password}
                        hint="Optionnel — 4 caractères min., requis si l’accès public est désactivé."
                    >
                        <Password
                            inputId="share-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            toggleMask
                            feedback={false}
                            placeholder="Laissez vide pour un accès sans mot de passe"
                            className={errors.password ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Permissions</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {PERMISSIONS.map((permission) => {
                                const Icon = permission.icon;

                                return (
                                    <label
                                        key={permission.key}
                                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-3.5 py-3 transition hover:border-tasho-primary/30 hover:bg-gray-50"
                                    >
                                        <InputSwitch
                                            checked={Boolean(data[permission.key])}
                                            onChange={(event) =>
                                                setData(permission.key, event.value)
                                            }
                                        />
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                                <Icon className="h-4 w-4 text-gray-400" />
                                                {permission.label}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-gray-500">
                                                {permission.hint}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </form>
            </FormDialog>
        </AuthenticatedLayout>
    );
}
