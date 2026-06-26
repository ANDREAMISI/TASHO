import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { UserGroupIcon, ArrowRightIcon } from '@/Components/Icons';

export default function InvitationDeclined({ invitation }) {
    return (
        <GuestLayout>
            <Head title="Invitation refusée - TASHO" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserGroupIcon className="h-12 w-12 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Invitation refusée
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Vous avez refusé l'invitation à rejoindre{' '}
                            <span className="font-medium">{invitation.team.name}</span>.
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                            Vous pouvez toujours demander une nouvelle invitation.
                        </p>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90 transition"
                    >
                        Retour à l'accueil
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}