import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Setup({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Configuration du tableau de bord" />

            <div className="py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-2xl p-8 text-center">
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Bienvenue sur TASHO
                        </h1>
                        <p className="mt-4 text-gray-600">
                            Nous avons besoin de quelques informations pour configurer votre espace de travail.
                        </p>
                        <div className="mt-8 space-y-4">
                            <p className="text-left text-gray-700">
                                1. Créez votre première équipe ou rejoignez une équipe existante.
                            </p>
                            <p className="text-left text-gray-700">
                                2. Ajoutez un projet pour commencer à gérer vos fichiers et clients.
                            </p>
                            <p className="text-left text-gray-700">
                                3. Explorez le tableau de bord pour suivre vos performances et votre stockage.
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/team/create"
                                className="inline-flex items-center justify-center px-6 py-3 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90"
                            >
                                Créer une équipe
                            </Link>
                            <Link
                                href="/projects/create"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Créer un projet
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
