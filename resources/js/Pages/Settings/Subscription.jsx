import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SubscriptionSettings({ auth, user }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Abonnement" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Abonnement</h1>
                        <p className="mt-2 text-gray-600">Détails de votre abonnement et usage de stockage.</p>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-lg font-medium text-gray-900">Plan actuel</h2>
                                <p className="mt-2 text-sm text-gray-500">À définir selon vos données.</p>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-lg font-medium text-gray-900">Usage de stockage</h2>
                                <p className="mt-2 text-sm text-gray-500">Vos détails s'afficheront ici.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
