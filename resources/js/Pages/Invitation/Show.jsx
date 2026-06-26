import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    UserGroupIcon, 
    UserIcon, 
    ClockIcon,
    CheckIcon,
    XIcon,
    ArrowRightIcon,
    MailIcon,
    LockIcon
} from '@/Components/Icons';

export default function InvitationShow({ invitation, user, hasAccount }) {
    const { data, setData, post, processing } = useForm({
        accept: true,
    });

    const acceptInvitation = () => {
        post(route('invitation.accept', invitation.token));
    };

    const declineInvitation = () => {
        post(route('invitation.decline', invitation.token));
    };

    const roleLabels = {
        owner: 'Propriétaire',
        manager: 'Manager',
        editor: 'Éditeur',
        viewer: 'Observateur',
    };

    const roleDescriptions = {
        owner: 'A tous les droits sur l\'équipe',
        manager: 'Peut gérer les membres et les projets',
        editor: 'Peut créer et modifier des contenus',
        viewer: 'Peut consulter les contenus',
    };

    return (
        <GuestLayout>
            <Head title="Invitation - TASHO" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                            </div>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Vous êtes invité à rejoindre
                        </h2>
                        <p className="mt-1 text-xl font-semibold text-tasho-primary">
                            {invitation.team.name}
                        </p>
                    </div>

                    {/* Invitation Card */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 space-y-4">
                            {/* Invited By */}
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="h-5 w-5 text-tasho-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Invité par</p>
                                    <p className="font-medium text-gray-900">{invitation.invited_by.name}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Rôle</p>
                                        <p className="font-medium text-gray-900">{roleLabels[invitation.role]}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-tasho-primary/10 text-tasho-primary rounded-full text-xs font-medium">
                                        {invitation.role.toUpperCase()}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {roleDescriptions[invitation.role]}
                                </p>
                            </div>

                            {/* Expiration */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <ClockIcon className="h-4 w-4" />
                                <span>
                                    Invitation valable jusqu'au {new Date(invitation.expires_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            {/* Email */}
                            {invitation.email && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <MailIcon className="h-4 w-4" />
                                    <span>Envoyée à {invitation.email}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 p-6 space-y-4">
                            {!hasAccount ? (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            Vous n'avez pas encore de compte TASHO ?
                                            <br />
                                            <span className="font-medium">
                                                Inscrivez-vous pour rejoindre cette équipe.
                                            </span>
                                        </p>
                                    </div>
                                    <Link
                                        href={route('register')}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90 transition"
                                    >
                                        Créer un compte et accepter
                                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                                    </Link>
                                    <p className="text-center text-sm text-gray-500">
                                        Vous avez déjà un compte ?{' '}
                                        <Link href={route('login')} className="text-tasho-primary hover:underline">
                                            Connectez-vous
                                        </Link>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                                        <CheckIcon className="h-4 w-4" />
                                        <span>Connecté en tant que {user.name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={acceptInvitation}
                                            disabled={processing}
                                            className="flex items-center justify-center px-4 py-3 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90 transition disabled:opacity-50"
                                        >
                                            <CheckIcon className="h-4 w-4 mr-2" />
                                            Accepter
                                        </button>
                                        <button
                                            onClick={declineInvitation}
                                            disabled={processing}
                                            className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                                        >
                                            <XIcon className="h-4 w-4 mr-2" />
                                            Refuser
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Secure Note */}
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                            <LockIcon className="h-3 w-3" />
                            <span>Invitation sécurisée</span>
                            <span className="w-px h-4 bg-gray-300" />
                            <span>Valable 7 jours</span>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}