import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Button from '@/Components/Button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import AvatarCropDialog from '@/Components/Profile/AvatarCropDialog';
import {
    Camera,
    CalendarIcon,
    CloudIcon,
    DocumentIcon,
    EnvelopeIcon,
    FolderIcon,
    PencilIcon,
    ShieldCheckIcon,
    UsersIcon,
} from '@/Components/Icons';
import { formatBytes, formatDate, formatNumber } from '@/utils/format';

const WORK_TYPE_OPTIONS = [
    { value: 'alone', label: 'Indépendant' },
    { value: 'team', label: 'En équipe' },
];

const STAT_TONES = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
};

function StatTile({ icon: Icon, label, value, tone = 'indigo' }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    STAT_TONES[tone] || STAT_TONES.indigo
                }`}
            >
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-500">{label}</p>
                <p className="text-lg font-semibold tracking-tight text-gray-900 tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );
}

function InfoItem({ label, value, className = '' }) {
    return (
        <div className={className}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
                {value || <span className="font-normal text-gray-400">Non renseigné</span>}
            </dd>
        </div>
    );
}

export default function ProfileEdit({ stats = {}, memberSince = null, mustVerifyEmail = false }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const initials = user.initials || (user.name || 'U').charAt(0).toUpperCase();

    const [profileOpen, setProfileOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [avatarProcessing, setAvatarProcessing] = useState(false);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        profession: user.profession || '',
        work_type: user.work_type || 'alone',
        bio: user.bio || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const openProfile = () => {
        profileForm.setData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            country: user.country || '',
            profession: user.profession || '',
            work_type: user.work_type || 'alone',
            bio: user.bio || '',
        });
        profileForm.clearErrors();
        setProfileOpen(true);
    };

    const closeProfile = () => {
        if (profileForm.processing) {
            return;
        }

        setProfileOpen(false);
        profileForm.clearErrors();
    };

    const submitProfile = (event) => {
        event.preventDefault();

        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setProfileOpen(false),
        });
    };

    const uploadAvatar = (file) => {
        const data = new FormData();
        data.append('avatar', file);

        setAvatarProcessing(true);

        router.post(route('profile.avatar.update'), data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setAvatarOpen(false),
            onFinish: () => setAvatarProcessing(false),
        });
    };

    const removeAvatar = () => {
        confirmDialog({
            message: 'Supprimer votre photo de profil ? Vos initiales seront affichées à la place.',
            header: 'Supprimer la photo',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('profile.avatar.destroy'), {
                    preserveScroll: true,
                    onSuccess: () => setAvatarOpen(false),
                }),
        });
    };

    const openPassword = () => {
        passwordForm.reset();
        passwordForm.clearErrors();
        setPasswordOpen(true);
    };

    const closePassword = () => {
        if (passwordForm.processing) {
            return;
        }

        setPasswordOpen(false);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    const submitPassword = (event) => {
        event.preventDefault();

        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordOpen(false);
                passwordForm.reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                }

                if (errors.current_password) {
                    passwordForm.reset('current_password');
                }
            },
        });
    };

    const openDelete = () => {
        deleteForm.reset();
        deleteForm.clearErrors();
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        if (deleteForm.processing) {
            return;
        }

        setDeleteOpen(false);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const submitDelete = (event) => {
        event.preventDefault();

        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    };

    const workTypeLabel =
        user.work_type === 'team' ? 'En équipe' : user.work_type === 'alone' ? 'Indépendant' : null;

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Mon profil - TASHO" />

            <div className="mx-auto w-full max-w-5xl space-y-6">
                {/* En-tête */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-24 bg-gradient-to-r from-tasho-primary/15 via-sky-50 to-white" />

                    <div className="px-5 pb-5 sm:px-7">
                        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end gap-4">
                                <div className="relative shrink-0">
                                    <Avatar
                                        image={user.avatar_url || undefined}
                                        label={user.avatar_url ? undefined : initials}
                                        imageAlt={user.name}
                                        shape="circle"
                                        className={`!h-24 !w-24 !text-2xl !font-semibold ring-4 ring-white ${
                                            user.avatar_url
                                                ? '!bg-gray-100'
                                                : '!bg-tasho-primary !text-white'
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setAvatarOpen(true)}
                                        aria-label="Changer la photo de profil"
                                        className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md ring-1 ring-gray-200 transition hover:text-tasho-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="min-w-0 pb-1">
                                    <h1 className="truncate text-2xl font-semibold tracking-tight text-gray-900">
                                        {user.name}
                                    </h1>
                                    <p className="mt-0.5 truncate text-sm text-gray-500">
                                        {user.profession || 'Membre de l’espace client'}
                                        {workTypeLabel ? ` · ${workTypeLabel}` : ''}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                            <EnvelopeIcon className="h-3 w-3" />
                                            {user.email}
                                        </span>

                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                <ShieldCheckIcon className="h-3 w-3" />
                                                Vérifié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                Email non vérifié
                                            </span>
                                        )}

                                        {memberSince && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                                <CalendarIcon className="h-3 w-3" />
                                                Membre depuis {formatDate(memberSince)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pb-1">
                                <Button
                                    type="button"
                                    label="Changer la photo"
                                    icon="pi pi-camera"
                                    severity="secondary"
                                    outlined
                                    onClick={() => setAvatarOpen(true)}
                                />
                                <Button
                                    type="button"
                                    label="Modifier le profil"
                                    icon="pi pi-pencil"
                                    onClick={openProfile}
                                    className="!bg-tasho-primary !border-tasho-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatTile
                        icon={FolderIcon}
                        label="Projets"
                        value={formatNumber(stats.projects)}
                        tone="indigo"
                    />
                    <StatTile
                        icon={DocumentIcon}
                        label="Fichiers"
                        value={formatNumber(stats.files)}
                        tone="sky"
                    />
                    <StatTile
                        icon={CloudIcon}
                        label="Stockage utilisé"
                        value={formatBytes(stats.storage)}
                        tone="emerald"
                    />
                    <StatTile
                        icon={UsersIcon}
                        label="Équipes"
                        value={formatNumber(stats.teams)}
                        tone="amber"
                    />
                </div>

                {/* Informations personnelles */}
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                Informations personnelles
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Ces informations apparaissent sur votre profil et dans vos partages.
                            </p>
                        </div>

                        <Button
                            type="button"
                            label="Modifier"
                            icon="pi pi-pencil"
                            severity="secondary"
                            outlined
                            onClick={openProfile}
                        />
                    </div>

                    <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                        <InfoItem label="Nom complet" value={user.name} />
                        <InfoItem label="Email" value={user.email} />
                        <InfoItem label="Téléphone" value={user.phone} />
                        <InfoItem label="Pays" value={user.country} />
                        <InfoItem label="Profession" value={user.profession} />
                        <InfoItem label="Type de travail" value={workTypeLabel} />
                        <InfoItem label="Bio" value={user.bio} className="sm:col-span-2" />
                    </dl>

                    {mustVerifyEmail && !user.email_verified_at && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
                            Votre adresse email n'est pas encore vérifiée. Consultez votre boîte de
                            réception pour activer toutes les fonctionnalités.
                        </div>
                    )}
                </section>

                {/* Sécurité */}
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Sécurité</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Utilisez un mot de passe long et unique pour protéger votre compte.
                            </p>
                        </div>

                        <Button
                            type="button"
                            label="Changer le mot de passe"
                            icon="pi pi-lock"
                            severity="secondary"
                            outlined
                            onClick={openPassword}
                        />
                    </div>
                </section>

                {/* Zone sensible */}
                <section className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-red-700">
                                Supprimer le compte
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Cette action est définitive : vos projets, fichiers et partages
                                seront supprimés.
                            </p>
                        </div>

                        <Button
                            type="button"
                            label="Supprimer"
                            icon="pi pi-trash"
                            severity="danger"
                            outlined
                            onClick={openDelete}
                        />
                    </div>
                </section>
            </div>

            <AvatarCropDialog
                visible={avatarOpen}
                onHide={() => setAvatarOpen(false)}
                onUpload={uploadAvatar}
                onRemove={removeAvatar}
                hasAvatar={Boolean(user.avatar_url)}
                processing={avatarProcessing}
            />

            <FormDialog
                visible={profileOpen}
                onHide={closeProfile}
                title="Modifier le profil"
                description="Mettez à jour vos informations personnelles."
                icon="pi pi-user-edit"
                formId="profile-form"
                onSubmit={submitProfile}
                submitLabel={profileForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                processing={profileForm.processing}
                width="40rem"
                closable={!profileForm.processing}
            >
                <form id="profile-form" onSubmit={submitProfile} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            label="Nom complet"
                            htmlFor="profile-name"
                            required
                            error={profileForm.errors.name}
                        >
                            <InputText
                                id="profile-name"
                                value={profileForm.data.name}
                                onChange={(event) =>
                                    profileForm.setData('name', event.target.value)
                                }
                                className={profileForm.errors.name ? 'p-invalid' : ''}
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="Email"
                            htmlFor="profile-email"
                            required
                            error={profileForm.errors.email}
                            hint="Une modification vous demandera de vérifier votre email."
                        >
                            <InputText
                                id="profile-email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(event) =>
                                    profileForm.setData('email', event.target.value)
                                }
                                className={profileForm.errors.email ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Téléphone"
                            htmlFor="profile-phone"
                            error={profileForm.errors.phone}
                        >
                            <InputText
                                id="profile-phone"
                                value={profileForm.data.phone}
                                onChange={(event) =>
                                    profileForm.setData('phone', event.target.value)
                                }
                                placeholder="+243 …"
                                className={profileForm.errors.phone ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Pays"
                            htmlFor="profile-country"
                            error={profileForm.errors.country}
                        >
                            <InputText
                                id="profile-country"
                                value={profileForm.data.country}
                                onChange={(event) =>
                                    profileForm.setData('country', event.target.value)
                                }
                                placeholder="Ex. RD Congo"
                                className={profileForm.errors.country ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Profession"
                            htmlFor="profile-profession"
                            error={profileForm.errors.profession}
                        >
                            <InputText
                                id="profile-profession"
                                value={profileForm.data.profession}
                                onChange={(event) =>
                                    profileForm.setData('profession', event.target.value)
                                }
                                placeholder="Ex. Photographe"
                                className={profileForm.errors.profession ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Type de travail"
                            htmlFor="profile-work-type"
                            error={profileForm.errors.work_type}
                        >
                            <Dropdown
                                inputId="profile-work-type"
                                value={profileForm.data.work_type}
                                options={WORK_TYPE_OPTIONS}
                                onChange={(event) =>
                                    profileForm.setData('work_type', event.value)
                                }
                                className="w-full"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Bio"
                        htmlFor="profile-bio"
                        error={profileForm.errors.bio}
                        hint={`${profileForm.data.bio.length}/600 caractères`}
                    >
                        <InputTextarea
                            id="profile-bio"
                            value={profileForm.data.bio}
                            onChange={(event) =>
                                profileForm.setData('bio', event.target.value.slice(0, 600))
                            }
                            rows={3}
                            autoResize
                            className={profileForm.errors.bio ? 'p-invalid' : ''}
                            placeholder="Quelques mots sur vous, votre activité…"
                        />
                    </FormField>

                    <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3.5 py-3 text-xs text-gray-500">
                        <PencilIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        Votre nom et votre photo sont visibles par les membres de vos équipes.
                    </div>
                </form>
            </FormDialog>

            <FormDialog
                visible={passwordOpen}
                onHide={closePassword}
                title="Changer le mot de passe"
                description="Confirmez votre mot de passe actuel pour continuer."
                icon="pi pi-lock"
                formId="password-form"
                onSubmit={submitPassword}
                submitLabel={passwordForm.processing ? 'Mise à jour…' : 'Mettre à jour'}
                processing={passwordForm.processing}
                width="34rem"
                closable={!passwordForm.processing}
            >
                <form id="password-form" onSubmit={submitPassword} className="space-y-5">
                    <FormField
                        label="Mot de passe actuel"
                        htmlFor="current-password"
                        required
                        error={passwordForm.errors.current_password}
                    >
                        <Password
                            inputId="current-password"
                            value={passwordForm.data.current_password}
                            onChange={(event) =>
                                passwordForm.setData('current_password', event.target.value)
                            }
                            toggleMask
                            feedback={false}
                            className={passwordForm.errors.current_password ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Nouveau mot de passe"
                        htmlFor="new-password"
                        required
                        error={passwordForm.errors.password}
                    >
                        <Password
                            inputId="new-password"
                            value={passwordForm.data.password}
                            onChange={(event) =>
                                passwordForm.setData('password', event.target.value)
                            }
                            toggleMask
                            className={passwordForm.errors.password ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Confirmer le mot de passe"
                        htmlFor="confirm-password"
                        required
                    >
                        <Password
                            inputId="confirm-password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(event) =>
                                passwordForm.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            toggleMask
                            feedback={false}
                        />
                    </FormField>
                </form>
            </FormDialog>

            <FormDialog
                visible={deleteOpen}
                onHide={closeDelete}
                title="Supprimer le compte"
                description="Cette action est irréversible."
                icon="pi pi-exclamation-triangle"
                formId="delete-account-form"
                onSubmit={submitDelete}
                submitLabel={deleteForm.processing ? 'Suppression…' : 'Supprimer définitivement'}
                submitIcon="pi pi-trash"
                processing={deleteForm.processing}
                danger
                width="34rem"
                closable={!deleteForm.processing}
            >
                <form id="delete-account-form" onSubmit={submitDelete} className="space-y-5">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                        Tous vos projets, fichiers et liens de partage seront définitivement
                        supprimés.
                    </div>

                    <FormField
                        label="Confirmez avec votre mot de passe"
                        htmlFor="delete-password"
                        required
                        error={deleteForm.errors.password}
                    >
                        <Password
                            inputId="delete-password"
                            value={deleteForm.data.password}
                            onChange={(event) =>
                                deleteForm.setData('password', event.target.value)
                            }
                            toggleMask
                            feedback={false}
                            className={deleteForm.errors.password ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>
                </form>
            </FormDialog>

            <ConfirmDialog />
        </AuthenticatedLayout>
    );
}
