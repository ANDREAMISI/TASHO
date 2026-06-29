import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    UsersIcon,
    UserGroupIcon,
    CreditCardIcon,
    CloudIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentIcon,
    EyeIcon,
} from '@/Components/Icons';

export default function AdminDashboard({ auth, stats }) {
    // Statistiques par défaut si non fournies
    const users = stats?.users || { total: 0, active: 0, new_this_month: 0 };
    const teams = stats?.teams || { total: 0, active: 0 };
    const subscriptions = stats?.subscriptions || { total: 0, by_plan: {} };
    const storage = stats?.storage || { total: 0 };
    const activity = stats?.activity || { total_logs: 0, today: 0 };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const statCards = [
        {
            title: 'Utilisateurs',
            value: users.total || 0,
            subtitle: `${users.active || 0} actifs ce mois`,
            icon: UsersIcon,
            color: 'bg-blue-500',
        },
        {
            title: 'Équipes',
            value: teams.total || 0,
            subtitle: `${teams.active || 0} actives`,
            icon: UserGroupIcon,
            color: 'bg-purple-500',
        },
        {
            title: 'Abonnements',
            value: subscriptions.total || 0,
            subtitle: 'actifs',
            icon: CreditCardIcon,
            color: 'bg-green-500',
        },
        {
            title: 'Stockage total',
            value: formatSize(storage.total || 0),
            subtitle: 'utilisé',
            icon: CloudIcon,
            color: 'bg-orange-500',
        },
    ];

    return (
        <AdminLayout user={auth.user}>
            <Head title="Dashboard - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Dashboard Administration
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Vue d'ensemble de la plateforme TASHO
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href={route('admin.users.index')}
                                className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                <UsersIcon className="h-4 w-4 inline mr-2" />
                                Gérer les utilisateurs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 ${stat.color} bg-opacity-10 rounded-lg p-3`}>
                                                <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        {stat.title}
                                                    </dt>
                                                    <dd className="text-2xl font-semibold text-gray-900">
                                                        {stat.value}
                                                    </dd>
                                                    {stat.subtitle && (
                                                        <dd className="text-xs text-gray-400">
                                                            {stat.subtitle}
                                                        </dd>
                                                    )}
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Subscriptions by Plan */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Abonnements par plan</h3>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.keys(subscriptions.by_plan || {}).length > 0 ? (
                                Object.entries(subscriptions.by_plan).map(([plan, count]) => (
                                    <div key={plan} className="bg-gray-50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-tasho-primary">{count}</p>
                                        <p className="text-sm text-gray-500">{plan}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-4 text-center py-4 text-gray-500">
                                    Aucun abonnement actif
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Activité</h3>
                            <div className="mt-4 flex items-center space-x-8">
                                <div>
                                    <p className="text-sm text-gray-500">Total actions</p>
                                    <p className="text-2xl font-bold text-gray-900">{activity.total_logs || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Aujourd'hui</p>
                                    <p className="text-2xl font-bold text-gray-900">{activity.today || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Link
                                    href={route('admin.users.index')}
                                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-tasho-primary/10 transition"
                                >
                                    <UsersIcon className="h-6 w-6 mx-auto text-tasho-primary" />
                                    <p className="text-xs text-gray-600 mt-1">Utilisateurs</p>
                                </Link>
                                <Link
                                    href={route('admin.subscriptions.index')}
                                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-tasho-primary/10 transition"
                                >
                                    <CreditCardIcon className="h-6 w-6 mx-auto text-tasho-primary" />
                                    <p className="text-xs text-gray-600 mt-1">Abonnements</p>
                                </Link>
                                <Link
                                    href={route('admin.teams.index')}
                                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-tasho-primary/10 transition"
                                >
                                    <UserGroupIcon className="h-6 w-6 mx-auto text-tasho-primary" />
                                    <p className="text-xs text-gray-600 mt-1">Équipes</p>
                                </Link>
                                <Link
                                    href={route('activity.index')}
                                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-tasho-primary/10 transition"
                                >
                                    <EyeIcon className="h-6 w-6 mx-auto text-tasho-primary" />
                                    <p className="text-xs text-gray-600 mt-1">Activité</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}