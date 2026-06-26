import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function VerifyEmail() {
    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-sm text-gray-600">
                Vérification d'email désactivée. Vous pouvez retourner au dashboard.
            </div>

            <div className="mt-4">
                <a href="/dashboard" className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md hover:bg-tasho-primary/90">
                    Aller au dashboard
                </a>
            </div>
        </GuestLayout>
    );
}
