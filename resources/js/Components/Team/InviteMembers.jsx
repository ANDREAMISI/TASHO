import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    UserPlusIcon, 
    XIcon, 
    CopyIcon, 
    CheckIcon,
    MailIcon,
    LinkIcon 
} from '@/Components/Icons';

export default function InviteMembers({ teamId, onSuccess }) {
    const [inviteMethod, setInviteMethod] = useState('email'); // 'email' | 'link'
    const [copied, setCopied] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'viewer',
        permissions: [],
        project_access: [],
    });

    const submitInvite = (e) => {
        e.preventDefault();
        post(route('team.invite', teamId), {
            preserveScroll: true,
            onSuccess: () => {
                reset('email');
                if (onSuccess) onSuccess();
            },
        });
    };

    const generateLink = async () => {
        try {
            const response = await fetch(route('invitation.generate-link'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    team_id: teamId,
                    role: data.role,
                }),
            });
            const result = await response.json();
            setGeneratedLink(result.link);
        } catch (error) {
            console.error('Erreur lors de la génération du lien', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const roleLabels = {
        manager: 'Manager',
        editor: 'Éditeur',
        viewer: 'Observateur',
    };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setInviteMethod('email')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        inviteMethod === 'email'
                            ? 'border-tasho-primary text-tasho-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <MailIcon className="h-4 w-4 inline mr-2" />
                    Par email
                </button>
                <button
                    onClick={() => setInviteMethod('link')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        inviteMethod === 'link'
                            ? 'border-tasho-primary text-tasho-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <LinkIcon className="h-4 w-4 inline mr-2" />
                    Par lien
                </button>
            </div>

            {/* Invite by Email */}
            {inviteMethod === 'email' && (
                <form onSubmit={submitInvite} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email du membre
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                placeholder="email@exemple.com"
                                required
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition disabled:opacity-50"
                            >
                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                Inviter
                            </button>
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rôle
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                        >
                            {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </form>
            )}

            {/* Invite by Link */}
            {inviteMethod === 'link' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rôle pour ce lien
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                        >
                            {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {!generatedLink ? (
                        <button
                            onClick={generateLink}
                            className="w-full flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Générer un lien d'invitation
                        </button>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Lien d'invitation généré
                                </span>
                                <button
                                    onClick={() => setGeneratedLink(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    className="flex-1 rounded-md border-gray-300 bg-white shadow-sm text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(generatedLink)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                                    title="Copier le lien"
                                >
                                    {copied ? (
                                        <CheckIcon className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <CopyIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Ce lien expire automatiquement dans 7 jours.
                                Partagez-le avec les personnes que vous souhaitez inviter.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}