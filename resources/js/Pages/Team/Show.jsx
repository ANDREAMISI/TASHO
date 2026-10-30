import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Button from '@/Components/Button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import {
    UserPlusIcon,
    PencilIcon,
    CopyIcon,
    CheckIcon,
    UserGroupIcon,
    ClockIcon,
    MailIcon,
    LinkIcon,
} from '@/Components/Icons';

const ROLE_OPTIONS = [
    { value: 'manager', label: 'Manager' },
    { value: 'editor', label: 'Éditeur' },
    { value: 'viewer', label: 'Observateur' },
];

const ROLE_LABELS = {
    owner: 'Propriétaire',
    manager: 'Manager',
    editor: 'Éditeur',
    viewer: 'Observateur',
};

const ROLE_COLORS = {
    owner: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800',
};

export default function TeamShow({ auth, team, members, invitations, canManage, canInvite }) {
    const [editOpen, setEditOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteMode, setInviteMode] = useState('email');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [linkError, setLinkError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: team.name,
        description: team.description || '',
    });

    const inviteForm = useForm({
        email: '',
        role: 'viewer',
        permissions: [],
        project_access: [],
    });

    // Seul le propriétaire (ou un super admin) peut nommer des managers.
    const availableRoles = useMemo(
        () =>
            team.can_assign_manager
                ? ROLE_OPTIONS
                : ROLE_OPTIONS.filter((option) => option.value !== 'manager'),
        [team.can_assign_manager],
    );

    const closeEdit = () => {
        if (processing) {
            return;
        }

        setEditOpen(false);
        reset();
        clearErrors();
    };

    const openEdit = () => {
        setData({
            name: team.name,
            description: team.description || '',
        });
        clearErrors();
        setEditOpen(true);
    };

    const submitUpdate = (event) => {
        event.preventDefault();

        put(route('team.update', team.id), {
            preserveScroll: true,
            onSuccess: () => setEditOpen(false),
        });
    };

    const openInvite = () => {
        inviteForm.clearErrors();
        setInviteMode('email');
        setGeneratedLink(null);
        setLinkError(null);
        setCopiedLink(false);
        setInviteOpen(true);
    };

    const closeInvite = () => {
        if (inviteForm.processing || generatingLink) {
            return;
        }

        setInviteOpen(false);
        inviteForm.reset();
        inviteForm.clearErrors();
        setGeneratedLink(null);
        setLinkError(null);
    };

    const generateInvitationLink = async () => {
        setGeneratingLink(true);
        setLinkError(null);

        try {
            const response = await window.axios.post(route('invitation.generate-link'), {
                team_id: team.id,
                role: inviteForm.data.role,
            });

            setGeneratedLink(response.data.link);
            router.reload({ only: ['invitations'], preserveScroll: true, preserveState: true });
        } catch (error) {
            const message =
                error.response?.data?.errors?.role?.[0] ||
                error.response?.data?.message ||
                'Impossible de générer le lien d’invitation.';
            setLinkError(message);
        } finally {
            setGeneratingLink(false);
        }
    };

    const submitInvite = (event) => {
        event.preventDefault();

        if (inviteMode === 'link') {
            generateInvitationLink();
            return;
        }

        inviteForm.post(route('team.invite', team.id), {
            preserveScroll: true,
            onSuccess: () => {
                setInviteOpen(false);
                inviteForm.reset();
            },
        });
    };

    const removeMember = (member) => {
        confirmDialog({
            message: `Voulez-vous vraiment retirer ${member.name} de l'équipe ?`,
            header: 'Retirer le membre',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Retirer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('team.remove-member', [team.id, member.id]), {
                    preserveScroll: true,
                }),
        });
    };

    const updateRole = (userId, role) => {
        router.put(
            route('team.update-role', [team.id, userId]),
            { role },
            { preserveScroll: true },
        );
    };

    const cancelInvitation = (invitation) => {
        confirmDialog({
            message: `Annuler l'invitation ${invitation.email || 'de ce lien'} ?`,
            header: 'Annuler l’invitation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Annuler l’invitation',
            rejectLabel: 'Conserver',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('team.cancel-invitation', invitation.id), {
                    preserveScroll: true,
                }),
        });
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Fallback pour les navigateurs sans Clipboard API.
            const input = document.createElement('textarea');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }

        if (id === 'generated') {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
            return;
        }

        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const managersCount = members.filter((member) => member.role === 'manager').length;
    const pendingCount = invitations.length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${team.name} - TASHO`} />

            <ConfirmDialog />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tasho-primary/10">
                                        <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                                        {team.description ? (
                                            <p className="text-sm text-gray-500">{team.description}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400">
                                                Propriétaire : {team.owner?.name || '—'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={openEdit}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            Modifier
                                        </button>
                                    )}
                                    {(canManage || canInvite) && (
                                        <button
                                            type="button"
                                            onClick={openInvite}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                                        >
                                            <UserPlusIcon className="h-4 w-4" />
                                            Inviter
                                        </button>
                                    )}
                                </div>
                            </div>
                            {team.is_owner && (
                                <div className="mt-2 flex items-center">
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                        Propriétaire
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                                <p className="text-sm text-gray-500">Membres</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                                <p className="text-sm text-gray-500">Invitations en attente</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{managersCount}</p>
                                <p className="text-sm text-gray-500">Managers</p>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-lg font-medium text-gray-900">Membres</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {members.map((member) => {
                                const isSelf = member.id === auth.user.id;

                                return (
                                    <div
                                        key={member.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-tasho-primary/10">
                                                {member.avatar ? (
                                                    <img
                                                        src={member.avatar}
                                                        alt={member.name}
                                                        className="h-10 w-10 object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-semibold text-tasho-primary">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {member.name}
                                                    {isSelf && (
                                                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                                            Vous
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {member.can_change_role ? (
                                                <Dropdown
                                                    value={member.role}
                                                    options={availableRoles}
                                                    onChange={(event) =>
                                                        updateRole(member.id, event.value)
                                                    }
                                                    className="w-40"
                                                    pt={{
                                                        root: { className: 'text-sm' },
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[member.role]}`}
                                                >
                                                    {ROLE_LABELS[member.role] || member.role}
                                                </span>
                                            )}
                                            {member.can_remove && (
                                                <Button
                                                    type="button"
                                                    icon="pi pi-user-minus"
                                                    rounded
                                                    text
                                                    severity="danger"
                                                    onClick={() => removeMember(member)}
                                                    tooltip="Retirer le membre"
                                                    tooltipOptions={{ position: 'left' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {members.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">Aucun membre dans cette équipe</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invitations */}
                    {invitations.length > 0 && (
                        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-200 p-6">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Invitations en attente
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Les liens sans email peuvent être partagés librement.
                                </p>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {invitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                    invitation.email
                                                        ? 'bg-yellow-100'
                                                        : 'bg-blue-100'
                                                }`}
                                            >
                                                {invitation.email ? (
                                                    <MailIcon className="h-5 w-5 text-yellow-600" />
                                                ) : (
                                                    <LinkIcon className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {invitation.email || "Lien d'invitation"}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[invitation.role]}`}
                                                    >
                                                        {ROLE_LABELS[invitation.role]}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <ClockIcon className="mr-1 h-3 w-3" />
                                                        Expire le{' '}
                                                        {new Date(
                                                            invitation.expires_at,
                                                        ).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                type="button"
                                                icon={
                                                    copiedId === invitation.id
                                                        ? 'pi pi-check'
                                                        : 'pi pi-copy'
                                                }
                                                rounded
                                                text
                                                severity={
                                                    copiedId === invitation.id
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                                onClick={() =>
                                                    copyToClipboard(
                                                        invitation.invite_link,
                                                        invitation.id,
                                                    )
                                                }
                                                tooltip="Copier le lien"
                                                tooltipOptions={{ position: 'left' }}
                                            />
                                            {canManage && (
                                                <Button
                                                    type="button"
                                                    icon="pi pi-times"
                                                    rounded
                                                    text
                                                    severity="danger"
                                                    onClick={() => cancelInvitation(invitation)}
                                                    tooltip="Annuler l'invitation"
                                                    tooltipOptions={{ position: 'left' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modale d'édition de l'équipe */}
            <FormDialog
                visible={editOpen}
                onHide={closeEdit}
                title="Modifier l'équipe"
                description="Nom et description visibles par les membres."
                icon="pi pi-pencil"
                formId="team-edit-form"
                onSubmit={submitUpdate}
                submitLabel={processing ? 'Enregistrement…' : 'Enregistrer'}
                processing={processing}
                width="34rem"
                closable={!processing}
            >
                <form id="team-edit-form" onSubmit={submitUpdate} className="space-y-5">
                    <FormField
                        label="Nom de l'équipe"
                        htmlFor="team-edit-name"
                        required
                        error={errors.name}
                    >
                        <InputText
                            id="team-edit-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className={errors.name ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="team-edit-description"
                        error={errors.description}
                    >
                        <InputTextarea
                            id="team-edit-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={3}
                            autoResize
                            maxLength={500}
                            className={errors.description ? 'p-invalid' : ''}
                        />
                    </FormField>
                </form>
            </FormDialog>

            {/* Modale d'invitation */}
            <FormDialog
                visible={inviteOpen}
                onHide={closeInvite}
                title="Inviter un membre"
                description="Par email ou avec un lien à partager."
                icon="pi pi-user-plus"
                formId="team-invite-form"
                onSubmit={submitInvite}
                submitLabel={
                    inviteMode === 'link'
                        ? generatingLink
                            ? 'Génération…'
                            : generatedLink
                              ? 'Régénérer le lien'
                              : 'Générer le lien'
                        : inviteForm.processing
                          ? 'Envoi…'
                          : 'Envoyer l’invitation'
                }
                submitIcon={inviteMode === 'link' ? 'pi pi-link' : 'pi pi-send'}
                processing={inviteForm.processing || generatingLink}
                width="34rem"
                closable={!inviteForm.processing && !generatingLink}
            >
                <form id="team-invite-form" onSubmit={submitInvite} className="space-y-5">
                    {/* Mode */}
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setInviteMode('email');
                                setLinkError(null);
                            }}
                            className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                inviteMode === 'email'
                                    ? 'bg-white text-tasho-primary shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <MailIcon className="h-4 w-4" />
                            Par email
                        </button>
                        <button
                            type="button"
                            onClick={() => setInviteMode('link')}
                            className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                inviteMode === 'link'
                                    ? 'bg-white text-tasho-primary shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <LinkIcon className="h-4 w-4" />
                            Par lien
                        </button>
                    </div>

                    {inviteMode === 'email' ? (
                        <FormField
                            label="Email"
                            htmlFor="invite-email"
                            error={inviteForm.errors.email}
                            hint="Un email d’invitation sera envoyé automatiquement."
                        >
                            <InputText
                                id="invite-email"
                                type="email"
                                value={inviteForm.data.email}
                                onChange={(event) => inviteForm.setData('email', event.target.value)}
                                placeholder="email@exemple.com"
                                className={inviteForm.errors.email ? 'p-invalid' : ''}
                                autoFocus
                            />
                        </FormField>
                    ) : (
                        <div className="space-y-3">
                            {!generatedLink ? (
                                <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                                    Un lien valable 7 jours sera créé. Toute personne disposant du
                                    lien pourra rejoindre l’équipe avec le rôle choisi.
                                </p>
                            ) : (
                                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-700">
                                        Lien d’invitation généré
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={generatedLink}
                                            readOnly
                                            onFocus={(event) => event.target.select()}
                                            className="flex-1 rounded-md border-gray-300 bg-white text-sm shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(generatedLink, 'generated')}
                                            className="p-2 text-gray-500 transition hover:text-gray-800"
                                            title="Copier le lien"
                                        >
                                            {copiedLink ? (
                                                <CheckIcon className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <CopyIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Ce lien expire automatiquement dans 7 jours.
                                    </p>
                                </div>
                            )}
                            {linkError && (
                                <p className="text-sm text-red-600">{linkError}</p>
                            )}
                        </div>
                    )}

                    <FormField
                        label="Rôle"
                        htmlFor="invite-role"
                        error={inviteForm.errors.role}
                        hint={
                            !team.can_assign_manager
                                ? 'Seul le propriétaire peut attribuer le rôle Manager.'
                                : undefined
                        }
                    >
                        <Dropdown
                            inputId="invite-role"
                            value={inviteForm.data.role}
                            options={availableRoles}
                            onChange={(event) => inviteForm.setData('role', event.value)}
                            placeholder="Choisir un rôle"
                        />
                    </FormField>
                </form>
            </FormDialog>
        </AuthenticatedLayout>
    );
}
