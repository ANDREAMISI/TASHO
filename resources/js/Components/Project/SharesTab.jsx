import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Password } from 'primereact/password';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import {
    ArrowUpRightIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    CopyIcon,
    EyeIcon,
    GlobeAltIcon,
    LockClosedIcon,
    PlusIcon,
    ShareIcon,
    TrashIcon,
    XMarkIcon,
} from '@/Components/Icons';
import { formatDate, plural, timeAgo } from '@/utils/format';

const EXPIRATION_OPTIONS = [
    { label: '7 jours', value: 7 },
    { label: '30 jours', value: 30 },
    { label: '90 jours', value: 90 },
    { label: '1 an', value: 365 },
    { label: 'Sans expiration', value: 0 },
];

function PermissionBadge({ enabled, label }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                enabled
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-400 line-through'
            }`}
        >
            {enabled ? <CheckIcon className="h-3 w-3" /> : <XMarkIcon className="h-3 w-3" />}
            {label}
        </span>
    );
}

function SwitchRow({ label, description, checked, onChange }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
            </div>
            <InputSwitch checked={checked} onChange={(event) => onChange(event.value)} />
        </div>
    );
}

function expiryLabel(access) {
    if (!access.expires_at) {
        return 'Sans expiration';
    }

    if (new Date(access.expires_at) < new Date()) {
        return `Expiré le ${formatDate(access.expires_at)}`;
    }

    return `Expire le ${formatDate(access.expires_at)}`;
}

export default function SharesTab({ project, accesses = [], clients = [], canManage = false }) {
    const [open, setOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const form = useForm({
        client_id: '',
        client_name: '',
        client_email: '',
        is_public: false,
        can_download: true,
        can_comment: true,
        can_favorite: true,
        expires_in_days: 30,
        max_views: '',
        password: '',
    });

    const openDialog = () => {
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        form.post(route('shares.share', project.id), {
            preserveScroll: true,
            transform: (data) => ({
                client_id:
                    data.client_id && data.client_id !== 'new' ? data.client_id : null,
                client_name: data.client_id === 'new' ? data.client_name : null,
                client_email: data.client_id === 'new' ? data.client_email : null,
                is_public: data.is_public,
                can_download: data.can_download,
                can_comment: data.can_comment,
                can_favorite: data.can_favorite,
                expires_in_days: data.expires_in_days || null,
                max_views: data.max_views || null,
                password: data.password || null,
            }),
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    const copyLink = async (access) => {
        try {
            await navigator.clipboard.writeText(access.share_url);
            setCopiedId(access.id);
            window.setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Copie impossible :', error);
        }
    };

    const revoke = (access) => {
        const name = access.client?.name || 'cet accès';

        confirmDialog({
            message: `Révoquer l'accès de ${name} ? Le lien ne fonctionnera plus.`,
            header: 'Révoquer le partage',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Révoquer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('shares.revoke', access.id), { preserveScroll: true }),
        });
    };

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Partages du projet</h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {plural(accesses.length, 'lien d’accès actif', 'liens d’accès actifs')}
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={openDialog}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nouveau partage
                        </button>
                    )}
                </header>

                {accesses.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {accesses.map((access) => {
                            const isCopied = copiedId === access.id;

                            return (
                                <li key={access.id} className="px-5 py-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                                    access.is_public
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {access.is_public ? (
                                                    <GlobeAltIcon className="h-5 w-5" />
                                                ) : (
                                                    <LockClosedIcon className="h-5 w-5" />
                                                )}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {access.client?.name || 'Lien sans client'}
                                                </p>
                                                <p className="truncate text-xs text-gray-500">
                                                    {access.client?.email ||
                                                        'Accessible à toute personne disposant du lien'}
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                            access.is_public
                                                                ? 'bg-sky-50 text-sky-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {access.is_public ? 'Public' : 'Privé'}
                                                    </span>

                                                    <PermissionBadge
                                                        enabled={access.can_download}
                                                        label="Téléchargement"
                                                    />
                                                    <PermissionBadge
                                                        enabled={access.can_comment}
                                                        label="Commentaires"
                                                    />
                                                    <PermissionBadge
                                                        enabled={access.can_favorite}
                                                        label="Favoris"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => copyLink(access)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                                            >
                                                {isCopied ? (
                                                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                                                ) : (
                                                    <CopyIcon className="h-3.5 w-3.5" />
                                                )}
                                                {isCopied ? 'Copié' : 'Copier le lien'}
                                            </button>

                                            <a
                                                href={access.share_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Ouvrir la galerie"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
                                            >
                                                <ArrowUpRightIcon className="h-4 w-4" />
                                            </a>

                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() => revoke(access)}
                                                    title="Révoquer"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <EyeIcon className="h-3.5 w-3.5 text-gray-400" />
                                            {access.view_count} vue{access.view_count > 1 ? 's' : ''}
                                            {access.max_views ? ` / ${access.max_views}` : ''}
                                        </span>

                                        <span className="inline-flex items-center gap-1">
                                            <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                            {expiryLabel(access)}
                                        </span>

                                        <span className="inline-flex items-center gap-1">
                                            <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                                            {access.last_accessed_at
                                                ? `Dernier accès ${timeAgo(access.last_accessed_at)}`
                                                : 'Jamais consulté'}
                                        </span>

                                        <span className="text-gray-400">
                                            Créé {timeAgo(access.created_at)}
                                        </span>
                                    </div>

                                    <p className="mt-2 truncate rounded-md bg-gray-50 px-2 py-1 font-mono text-[11px] text-gray-500">
                                        {access.share_url}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <ShareIcon className="h-7 w-7" />
                        </span>
                        <p className="mt-4 text-sm font-medium text-gray-900">
                            Aucun partage pour ce projet
                        </p>
                        <p className="mt-1 max-w-sm text-xs text-gray-500">
                            Créez un lien sécurisé pour donner accès aux fichiers de ce projet à un
                            client, avec ou sans mot de passe.
                        </p>

                        {canManage && (
                            <button
                                type="button"
                                onClick={openDialog}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Créer un partage
                            </button>
                        )}
                    </div>
                )}
            </section>

            <FormDialog
                visible={open}
                onHide={() => setOpen(false)}
                title="Nouveau partage"
                description={`Galerie « ${project.title} »`}
                icon="pi pi-link"
                formId="project-share-form"
                onSubmit={submit}
                submitLabel={form.processing ? 'Création…' : 'Créer le partage'}
                submitIcon="pi pi-share-alt"
                processing={form.processing}
                width="38rem"
                closable={!form.processing}
            >
                <form id="project-share-form" onSubmit={submit} className="space-y-4">
                    <FormField label="Client" htmlFor="project-share-client" error={form.errors.client_id}>
                        <Dropdown
                            inputId="project-share-client"
                            value={form.data.client_id}
                            options={[
                                { label: 'Lien libre (sans client)', value: '' },
                                ...clients.map((client) => ({
                                    label: client.email
                                        ? `${client.name} (${client.email})`
                                        : client.name,
                                    value: client.id,
                                })),
                                { label: 'Nouveau client…', value: 'new' },
                            ]}
                            onChange={(event) => form.setData('client_id', event.value)}
                            placeholder="Sélectionner un client"
                            className="w-full"
                            filter
                        />
                    </FormField>

                    {form.data.client_id === 'new' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label="Nom" htmlFor="project-share-client-name">
                                <InputText
                                    id="project-share-client-name"
                                    value={form.data.client_name}
                                    onChange={(event) =>
                                        form.setData('client_name', event.target.value)
                                    }
                                    placeholder="Nom du client"
                                    className="w-full"
                                />
                            </FormField>

                            <FormField
                                label="E-mail"
                                htmlFor="project-share-client-email"
                                error={form.errors.client_email}
                            >
                                <InputText
                                    id="project-share-client-email"
                                    type="email"
                                    value={form.data.client_email}
                                    onChange={(event) =>
                                        form.setData('client_email', event.target.value)
                                    }
                                    placeholder="client@exemple.com"
                                    className="w-full"
                                />
                            </FormField>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField label="Durée du lien" htmlFor="project-share-expires">
                            <Dropdown
                                inputId="project-share-expires"
                                value={form.data.expires_in_days}
                                options={EXPIRATION_OPTIONS}
                                onChange={(event) =>
                                    form.setData('expires_in_days', event.value)
                                }
                                className="w-full"
                            />
                        </FormField>

                        <FormField
                            label="Vues maximum"
                            htmlFor="project-share-max-views"
                            error={form.errors.max_views}
                        >
                            <InputNumber
                                inputId="project-share-max-views"
                                value={form.data.max_views}
                                onValueChange={(event) => form.setData('max_views', event.value)}
                                min={1}
                                placeholder="Illimité"
                                className="w-full"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Mot de passe"
                        htmlFor="project-share-password"
                        error={form.errors.password}
                        hint="Optionnel — laissez vide pour un accès direct."
                    >
                        <Password
                            inputId="project-share-password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            toggleMask
                            feedback={false}
                            placeholder="Laisser vide pour un accès direct"
                            className="w-full"
                        />
                    </FormField>

                    <div className="space-y-2">
                        <SwitchRow
                            label="Accès public"
                            description="Sans authentification ni mot de passe."
                            checked={form.data.is_public}
                            onChange={(value) => form.setData('is_public', value)}
                        />

                        <SwitchRow
                            label="Autoriser le téléchargement"
                            checked={form.data.can_download}
                            onChange={(value) => form.setData('can_download', value)}
                        />

                        <SwitchRow
                            label="Autoriser les commentaires"
                            checked={form.data.can_comment}
                            onChange={(value) => form.setData('can_comment', value)}
                        />

                        <SwitchRow
                            label="Autoriser les favoris"
                            checked={form.data.can_favorite}
                            onChange={(value) => form.setData('can_favorite', value)}
                        />
                    </div>
                </form>
            </FormDialog>

            <ConfirmDialog />
        </div>
    );
}
