import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SettingsIndex({ auth, user }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Paramètres" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
                        <p className="mt-2 text-gray-600">Gérez votre profil et vos préférences.</p>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-lg font-medium text-gray-900">Profil</h2>
                                <p className="mt-2 text-sm text-gray-500">Nom : {user.name}</p>
                                <p className="text-sm text-gray-500">Email : {user.email}</p>
                            </div>

                            <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-lg font-medium text-gray-900">Abonnement</h2>
                                <p className="mt-2 text-sm text-gray-500">Votre plan sera affiché ici.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
