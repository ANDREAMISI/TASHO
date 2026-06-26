import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    PlusIcon, 
    UsersIcon, 
    UserGroupIcon,
    ArrowRightIcon,
    HomeIcon 
} from '@/Components/Icons';

export default function TeamIndex({ auth, teams, currentTeam }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Équipes - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Équipes</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez vos équipes et collaborateurs
                            </p>
                        </div>
                        <Link
                            href={route('team.create')}
                            className="inline-flex items-center px-4 py-2 bg-tasho-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-tasho-primary/90 focus:outline-none focus:ring-2 focus:ring-tasho-primary focus:ring-offset-2 transition"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Créer une équipe
                        </Link>
                    </div>

                    {/* Current Team */}
                    {currentTeam && (
                        <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                        <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {currentTeam.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {currentTeam.members_count || 1} membres
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('team.show', currentTeam)}
                                    className="inline-flex items-center text-tasho-primary hover:text-tasho-primary/80 font-medium"
                                >
                                    Gérer l'équipe
                                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* All Teams */}
                    {teams.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Toutes vos équipes
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.map((team) => (
                                    <Link
                                        key={team.id}
                                        href={route('team.show', team)}
                                        className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-tasho-primary/20"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                                <UsersIcon className="h-6 w-6 text-tasho-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {team.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Propriétaire: {team.owner.name}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {teams.length === 0 && !currentTeam && (
                        <div className="mt-12 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <UsersIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Aucune équipe
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Commencez par créer votre première équipe
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('team.create')}
                                    className="inline-flex items-center px-4 py-2 bg-tasho-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-tasho-primary/90"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Créer une équipe
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}