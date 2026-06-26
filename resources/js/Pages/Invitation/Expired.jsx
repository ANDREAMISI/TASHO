import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ClockIcon, ArrowRightIcon } from '@/Components/Icons';

export default function InvitationExpired({ invitation }) {
    return (
        <GuestLayout>
            <Head title="Invitation expirée - TASHO" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center">
                            <ClockIcon className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Invitation expirée
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Cette invitation n'est plus valable. Elle a expiré le{' '}
                            {new Date(invitation.expires_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}.
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            Contactez l'administrateur de l'équipe pour une nouvelle invitation.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90 transition"
                        >
                            Retour à l'accueil
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}