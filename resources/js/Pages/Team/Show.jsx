import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import {
    UserPlusIcon,
    UserMinusIcon,
    PencilIcon,
    CopyIcon,
    CheckIcon,
    XIcon,
    UserGroupIcon,
    ClockIcon,
    MailIcon,
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
    const [copiedId, setCopiedId] = useState(null);

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
        setInviteOpen(true);
    };

    const closeInvite = () => {
        if (inviteForm.processing) {
            return;
        }

        setInviteOpen(false);
        inviteForm.reset();
        inviteForm.clearErrors();
    };

    const submitInvite = (event) => {
        event.preventDefault();

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
            header: "Annuler l'invitation",
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

    const copyInviteLink = (link, id) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${team.name} - TASHO`} />

            <ConfirmDialog />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                                        {team.description && (
                                            <p className="text-sm text-gray-500">{team.description}</p>
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
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Propriétaire
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                                <p className="text-sm text-gray-500">Membres</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
                                <p className="text-sm text-gray-500">Invitations en attente</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {members.filter((member) => member.role === 'manager').length}
                                </p>
                                <p className="text-sm text-gray-500">Managers</p>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Membres</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="font-semibold text-tasho-primary">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {canManage && !team.is_owner && member.role !== 'owner' ? (
                                            <Dropdown
                                                value={member.role}
                                                options={ROLE_OPTIONS}
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
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}
                                            >
                                                {ROLE_LABELS[member.role] || member.role}
                                            </span>
                                        )}
                                        {canManage && member.role !== 'owner' && (
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
                            ))}
                            {members.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">Aucun membre dans cette équipe</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invitations */}
                    {invitations.length > 0 && (
                        <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Invitations en attente
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {invitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                <MailIcon className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {invitation.email || "Lien d'invitation"}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[invitation.role]}`}
                                                    >
                                                        {ROLE_LABELS[invitation.role]}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <ClockIcon className="h-3 w-3 mr-1" />
                                                        Expire le{' '}
                                                        {new Date(
                                                            invitation.expires_at,
                                                        ).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {invitation.email && (
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
                                                        copyInviteLink(
                                                            invitation.invite_link,
                                                            invitation.id,
                                                        )
                                                    }
                                                    tooltip="Copier le lien"
                                                    tooltipOptions={{ position: 'left' }}
                                                />
                                            )}
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
                description="Un lien d'invitation sera généré automatiquement."
                icon="pi pi-user-plus"
                formId="team-invite-form"
                onSubmit={submitInvite}
                submitLabel={inviteForm.processing ? 'Envoi…' : 'Envoyer l’invitation'}
                submitIcon="pi pi-send"
                processing={inviteForm.processing}
                width="32rem"
                closable={!inviteForm.processing}
            >
                <form id="team-invite-form" onSubmit={submitInvite} className="space-y-5">
                    <FormField
                        label="Email"
                        htmlFor="invite-email"
                        error={inviteForm.errors.email}
                        hint="Facultatif — laissez vide pour créer un simple lien à partager."
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

                    <FormField label="Rôle" htmlFor="invite-role" error={inviteForm.errors.role}>
                        <Dropdown
                            inputId="invite-role"
                            value={inviteForm.data.role}
                            options={ROLE_OPTIONS}
                            onChange={(event) => inviteForm.setData('role', event.value)}
                            placeholder="Choisir un rôle"
                        />
                    </FormField>
                </form>
            </FormDialog>
        </AuthenticatedLayout>
    );
}
