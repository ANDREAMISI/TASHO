import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ShareIndex({ auth, projects, selectedProject, accesses, team }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Partages - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Partages</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez les liens de partage et accès client.
                            </p>
                        </div>
                        <Link
                            href={route('shares.index')}
                            className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                        >
                            Actualiser
                        </Link>
                    </div>

                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Projet</label>
                            <select
                                value={selectedProject?.id || ''}
                                disabled
                                className="mt-2 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600"
                            >
                                <option value="">Sélectionnez un projet</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm font-medium text-gray-900">Accès</div>
                            <div className="mt-4 space-y-4">
                                {accesses.length > 0 ? (
                                    accesses.map((access) => (
                                        <div key={access.id} className="rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{access.client?.name || 'Invité'}</p>
                                                    <p className="text-xs text-gray-500">{access.share_url}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">{access.view_count} vues</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500">Aucun partage actif pour le projet sélectionné.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
