import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function ClientIndex({ auth, clients, filters, team }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clients - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez les clients de votre équipe {team?.name || ''}.
                            </p>
                        </div>
                        <Link
                            href={route('clients.index')}
                            className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                        >
                            Actualiser
                        </Link>
                    </div>

                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {clients.data && clients.data.length > 0 ? (
                                clients.data.map((client) => (
                                    <div key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-lg font-medium text-gray-900">{client.name}</p>
                                                <p className="text-sm text-gray-500">{client.email}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {client.company}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    Aucun client trouvé. Ajoutez des clients depuis vos projets ou votre équipe.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
