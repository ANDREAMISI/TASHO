import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    PencilIcon,
    TrashIcon,
    LinkIcon,
    CopyIcon,
    CheckIcon,
    XIcon,
    ChevronDownIcon,
    UserGroupIcon,
    ClockIcon,
    MailIcon,
} from '@/Components/Icons';

export default function TeamShow({ auth, team, members, invitations, canManage, canInvite }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: team.name,
        description: team.description || '',
    });

    const inviteForm = useForm({
        email: '',
        role: 'viewer',
        permissions: [],
        project_access: [],
    });

    const submitUpdate = (e) => {
        e.preventDefault();
        post(route('team.update', team.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const submitInvite = (e) => {
        e.preventDefault();
        post(route('team.invite', team.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowInviteModal(false);
                inviteForm.reset();
            },
        });
    };

    const removeMember = (userId) => {
        if (confirm('Voulez-vous vraiment retirer ce membre de l\'équipe ?')) {
            router.delete(route('team.remove-member', [team.id, userId]), {
                preserveScroll: true,
            });
        }
    };

    const updateRole = (userId, role) => {
        router.put(route('team.update-role', [team.id, userId]), { role }, {
            preserveScroll: true,
        });
    };

    const cancelInvitation = (invitationId) => {
        router.delete(route('team.cancel-invitation', invitationId), {
            preserveScroll: true,
        });
    };

    const copyInviteLink = (link) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const roleLabels = {
        owner: 'Propriétaire',
        manager: 'Manager',
        editor: 'Éditeur',
        viewer: 'Observateur',
    };

    const roleColors = {
        owner: 'bg-purple-100 text-purple-800',
        manager: 'bg-blue-100 text-blue-800',
        editor: 'bg-green-100 text-green-800',
        viewer: 'bg-gray-100 text-gray-800',
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${team.name} - TASHO`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <form onSubmit={submitUpdate} className="flex items-center space-x-4">
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary text-lg font-semibold"
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="px-3 py-1 bg-tasho-primary text-white rounded-md text-sm hover:bg-tasho-primary/90"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                                                {team.description && (
                                                    <p className="text-sm text-gray-500">{team.description}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {canManage && !isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            title="Modifier l'équipe"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    {canManage && !isEditing && (
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md text-sm font-medium hover:bg-tasho-primary/90 transition"
                                        >
                                            <UserPlusIcon className="h-4 w-4 mr-2" />
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
                                    {members.filter(m => m.role === 'manager').length}
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
                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
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
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                                            {roleLabels[member.role] || member.role}
                                        </span>
                                        {canManage && !team.is_owner && member.role !== 'owner' && (
                                            <div className="relative">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => updateRole(member.id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded-md focus:ring-tasho-primary focus:border-tasho-primary"
                                                >
                                                    <option value="manager">Manager</option>
                                                    <option value="editor">Éditeur</option>
                                                    <option value="viewer">Observateur</option>
                                                </select>
                                            </div>
                                        )}
                                        {canManage && member.role !== 'owner' && (
                                            <button
                                                onClick={() => removeMember(member.id)}
                                                className="text-red-400 hover:text-red-600 transition"
                                                title="Retirer le membre"
                                            >
                                                <UserMinusIcon className="h-5 w-5" />
                                            </button>
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
                                <h2 className="text-lg font-medium text-gray-900">Invitations en attente</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {invitations.map((invitation) => (
                                    <div key={invitation.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                <MailIcon className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {invitation.email || 'Lien d\'invitation'}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[invitation.role]}`}>
                                                        {roleLabels[invitation.role]}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <ClockIcon className="h-3 w-3 mr-1" />
                                                        Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {invitation.email && (
                                                <button
                                                    onClick={() => copyInviteLink(invitation.invite_link)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                                                    title="Copier le lien"
                                                >
                                                    {copied ? (
                                                        <CheckIcon className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <CopyIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                            {canManage && (
                                                <button
                                                    onClick={() => cancelInvitation(invitation.id)}
                                                    className="text-red-400 hover:text-red-600 transition"
                                                    title="Annuler l'invitation"
                                                >
                                                    <XIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Inviter un membre</h3>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={submitInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email (optionnel)
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteForm.data.email}
                                        onChange={(e) => inviteForm.setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        placeholder="email@exemple.com"
                                    />
                                    {inviteForm.errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{inviteForm.errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Rôle
                                    </label>
                                    <select
                                        value={inviteForm.data.role}
                                        onChange={(e) => inviteForm.setData('role', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="editor">Éditeur</option>
                                        <option value="viewer">Observateur</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={inviteForm.processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-tasho-primary rounded-md hover:bg-tasho-primary/90 disabled:opacity-50"
                                    >
                                        {inviteForm.processing ? 'Envoi...' : 'Envoyer l\'invitation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}