import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmAdminAction from '@/Components/AdminConfirmDialog';
import {
    ArrowLeftIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    CalendarIcon,
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    FolderIcon,
    DocumentIcon,
    UsersIcon,
} from '@/Components/Icons';
import { Phone } from 'lucide-react';

export default function UsersShow({ auth, user }) {
    const toggleUser = () => {
        confirmAdminAction({
            message: `Voulez-vous ${user.is_active ? 'désactiver' : 'activer'} cet utilisateur ?`,
            onAccept: () => router.post(route('admin.users.toggle', user.id), {}, { preserveScroll: true }),
        });
    };

    const deleteUser = () => {
        confirmAdminAction({
            header: 'Supprimer l’utilisateur',
            message: `Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`,
            danger: true,
            onAccept: () => router.delete(route('admin.users.destroy', user.id), {
                onSuccess: () => router.visit(route('admin.users.index')),
            }),
        });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`${user.name} - Administration`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.users.index')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Détails de l'utilisateur
                                </p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <section className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-sm font-medium text-gray-700">Équipes</h3>
                                    {user.teams?.length ? (
                                        <ul className="divide-y divide-gray-100">
                                            {user.teams.map((team) => (
                                                <li key={team.id} className="flex items-center justify-between py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{team.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {Number(team.owner_id) === Number(user.id) ? 'Propriétaire' : 'Membre'}
                                                        </p>
                                                    </div>
                                                    <span className={`rounded-full px-2 py-1 text-xs ${
                                                        team.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {team.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucune équipe.</p>
                                    )}
                                </section>

                                <section className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-sm font-medium text-gray-700">Abonnements</h3>
                                    {user.subscriptions?.length ? (
                                        <ul className="divide-y divide-gray-100">
                                            {user.subscriptions.map((subscription) => (
                                                <li key={subscription.id} className="flex items-center justify-between py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {subscription.plan?.name || 'Plan indisponible'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {subscription.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}
                                                            {subscription.end_date && ` · Fin : ${new Date(subscription.end_date).toLocaleDateString('fr-FR')}`}
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                        {subscription.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucun abonnement.</p>
                                    )}
                                </section>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleUser}
                                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${
                                    user.is_active
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                            >
                                {user.is_active ? (
                                    <>
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        Désactiver
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Activer
                                    </>
                                )}
                            </button>
                            <button
                                onClick={deleteUser}
                                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Supprimer
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-tasho-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                                    <p className={`text-sm font-medium ${
                                        user.is_active ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Informations</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-sm">
                                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{user.phone}</span>
                                    </div>
                                )}
                                {user.profession && (
                                    <div className="flex items-center text-sm">
                                        <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{user.profession}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                        Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{user.projects_count || 0}</p>
                                    <p className="text-xs text-gray-500">Projets</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{user.files_count || 0}</p>
                                    <p className="text-xs text-gray-500">Fichiers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{user.teams_count || 0}</p>
                                    <p className="text-xs text-gray-500">Équipes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{user.comments_count || 0}</p>
                                    <p className="text-xs text-gray-500">Commentaires</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}