import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ActivityChart from '@/Components/Dashboard/ActivityChart';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import GettingStarted from '@/Components/Dashboard/GettingStarted';
import RecentProjects from '@/Components/Dashboard/RecentProjects';
import StatsCard from '@/Components/Dashboard/StatsCard';
import StorageChart from '@/Components/Dashboard/StorageChart';
import StorageUsage from '@/Components/Dashboard/StorageUsage';
import {
    BoltIcon,
    CloudIcon,
    DocumentIcon,
    FolderIcon,
    PlusIcon,
    UsersIcon,
} from '@/Components/Icons';
import { formatBytes, formatNumber, plural } from '@/utils/format';

function greeting() {
    const hour = new Date().getHours();

    if (hour < 6) return 'Bonne nuit';
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';

    return 'Bonsoir';
}

function todayLabel() {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());
}

export default function Dashboard({ auth, stats, team }) {
    const { projects, files, clients, storage, activity, plan, recent_projects: recentProjects } =
        stats;

    const firstName = (auth.user?.name || '').split(' ')[0];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tableau de bord - TASHO" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* En-tête */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                {greeting()}
                                {firstName ? `, ${firstName}` : ''}
                            </h1>

                            {plan?.name && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-tasho-primary/10 px-2.5 py-0.5 text-xs font-medium text-tasho-primary">
                                    <BoltIcon className="h-3.5 w-3.5" />
                                    Plan {plan.name}
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Voici l'activité de{' '}
                            <span className="font-medium text-gray-700">{team?.name}</span> ·{' '}
                            {todayLabel()}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button href={route('projects.index')} variant="secondary">
                            Voir les projets
                        </Button>

                        <Button
                            href={route('projects.index', { create: 1 })}
                            variant="primary"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nouveau projet
                        </Button>
                    </div>
                </header>

                <GettingStarted projects={projects} files={files} clients={clients} />

                {/* Indicateurs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatsCard
                        label="Projets"
                        value={formatNumber(projects.total)}
                        icon={FolderIcon}
                        accent="indigo"
                        hint={`${plural(projects.active, 'actif', 'actifs')} · ${plural(
                            projects.completed,
                            'terminé',
                            'terminés',
                        )}`}
                        trend={projects.trend}
                        href={route('projects.index')}
                    />

                    <StatsCard
                        label="Fichiers"
                        value={formatNumber(files.total)}
                        icon={DocumentIcon}
                        accent="sky"
                        hint={`${plural(files.images, 'image', 'images')} · ${plural(
                            files.videos,
                            'vidéo',
                            'vidéos',
                        )} · ${plural(files.documents, 'document', 'documents')}`}
                        trend={files.trend}
                        href={route('projects.index')}
                    />

                    <StatsCard
                        label="Clients"
                        value={formatNumber(clients.total)}
                        icon={UsersIcon}
                        accent="emerald"
                        hint={`${plural(clients.active, 'client actif', 'clients actifs')} ce mois-ci`}
                        trend={clients.trend}
                        href={route('clients.index')}
                    />

                    <StatsCard
                        label="Stockage"
                        value={formatBytes(storage.used)}
                        icon={CloudIcon}
                        accent="amber"
                        hint={`sur ${formatBytes(storage.limit)} inclus dans votre plan`}
                        href={route('settings.subscription')}
                    >
                        <StorageUsage
                            used={storage.used}
                            limit={storage.limit}
                            percentage={storage.percentage}
                        />
                    </StatsCard>
                </div>

                {/* Activité + stockage */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <ActivityChart series={activity.series} className="xl:col-span-2" />
                    <StorageChart
                        types={storage.by_type}
                        used={storage.used}
                        limit={storage.limit}
                    />
                </div>

                {/* Projets + flux d'activité */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <RecentProjects projects={recentProjects} className="xl:col-span-2" />
                    <ActivityFeed activities={activity.recent} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
