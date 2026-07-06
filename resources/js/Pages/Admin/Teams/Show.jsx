import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    UserGroupIcon,
    UsersIcon,
    FolderIcon,
    DocumentIcon,
    CalendarIcon,
    UserIcon,
    EnvelopeIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
} from '@/Components/Icons';

export default function TeamsShow({ auth, team }) {
    const deleteTeam = () => {
        if (confirm(`Voulez-vous vraiment supprimer l'équipe "${team.name}" ?`)) {
            router.delete(route('admin.teams.destroy', team.id), {
                onSuccess: () => router.visit(route('admin.teams.index')),
            });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`${team.name} - Administration`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.teams.index')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {team.name}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Détails de l'équipe
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={deleteTeam}
                            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Supprimer l'équipe
                        </button>
                    </div>

                    {/* Team Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                    <UserGroupIcon className="h-8 w-8 text-tasho-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{team.name}</h2>
                                    <p className={`text-sm font-medium ${
                                        team.is_active ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {team.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center text-sm">
                                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                        Propriétaire: {team.owner?.name || 'Inconnu'}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                        {team.owner?.email || 'Email inconnu'}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                        Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{team.members_count || 0}</p>
                                    <p className="text-xs text-gray-500">Membres</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{team.projects_count || 0}</p>
                                    <p className="text-xs text-gray-500">Projets</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{team.files_count || 0}</p>
                                    <p className="text-xs text-gray-500">Fichiers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{team.subscription ? '✅' : '❌'}</p>
                                    <p className="text-xs text-gray-500">Abonnement</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Membres</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {team.members && team.members.length > 0 ? (
                                team.members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                <span className="font-medium text-tasho-primary">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {member.pivot?.role || 'Membre'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">Aucun membre dans cette équipe</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}