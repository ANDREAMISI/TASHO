import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from '@/Components/Dashboard/StatsCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';

export default function AdminDashboard({ auth, stats }) {
    const { users, teams, subscriptions, storage, activity, recent_users } = stats;

    return (
        <AdminLayout user={auth.user}>
            <Head title="Admin Dashboard - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Administration
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Vue d'ensemble de la plateforme
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Utilisateurs"
                            value={users.total}
                            icon="👥"
                            subtitle={`${users.active} actifs ce mois`}
                        />
                        <StatsCard
                            title="Équipes"
                            value={teams.total}
                            icon="🏢"
                            subtitle={`${teams.active} actives`}
                        />
                        <StatsCard
                            title="Abonnements"
                            value={subscriptions.total}
                            icon="💳"
                        />
                        <StatsCard
                            title="Stockage total"
                            value={(storage.total / 1073741824).toFixed(1) + ' GB'}
                            icon="💾"
                        />
                    </div>
                </div>

                {/* Subscriptions by Plan */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Abonnements par plan</h3>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(subscriptions.by_plan || {}).map(([plan, count]) => (
                                <div key={plan} className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-tasho-primary">{count}</p>
                                    <p className="text-sm text-gray-500">{plan}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Derniers utilisateurs inscrits</h3>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nom
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Profession
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inscrit le
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recent_users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.profession || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                        <div className="mt-4">
                            <ActivityFeed activities={activity} />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}