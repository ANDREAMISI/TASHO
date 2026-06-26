import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatsCard from '@/Components/Dashboard/StatsCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import StorageChart from '@/Components/Dashboard/StorageChart';
import ActivityChart from '@/Components/Dashboard/ActivityChart';
import StorageUsage from '@/Components/Dashboard/StorageUsage';
import { FolderIcon, DocumentIcon, UsersIcon, ChartBarIcon } from '@/Components/Icons';

export default function Dashboard({ auth, stats, team }) {
    const { projects, files, clients, activity, storage, trends } = stats;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {team?.name || 'Mon Espace'} · Bienvenue !
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                📊 Rapports
                            </button>
                            <Link
                                href={route('projects.create')}
                                className="bg-tasho-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-tasho-primary/90"
                            >
                                + Nouveau Projet
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Projets"
                            value={projects?.total || 0}
                            icon="📁"
                            subtitle={`${projects?.active || 0} actifs`}
                        />
                        <StatsCard
                            title="Fichiers"
                            value={files?.total || 0}
                            icon="📄"
                            subtitle={`${files?.images || 0} images, ${files?.videos || 0} vidéos`}
                        />
                        <StatsCard
                            title="Clients"
                            value={clients?.total || 0}
                            icon="👤"
                            subtitle={`${clients?.active || 0} actifs ce mois`}
                        />
                        <StatsCard
                            title="Équipe"
                            value={team?.members?.length || 1}
                            icon="👥"
                            subtitle={team?.owner?.name || 'Vous'}
                        />
                    </div>
                </div>

                {/* Storage Usage */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Stockage</h3>
                        <div className="mt-4">
                            <StorageUsage 
                                used={storage?.used || 0} 
                                limit={storage?.limit || 1073741824} 
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* File Distribution */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des fichiers</h3>
                            <StorageChart data={files || {}} />
                        </div>

                        {/* Activity Chart */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Activité (30 derniers jours)</h3>
                            <ActivityChart 
                                data={trends?.daily_activity || {}} 
                                labels={trends?.labels || []} 
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                        <div className="mt-4">
                            <ActivityFeed activities={activity || []} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}