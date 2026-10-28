import { Head, Link, router } from '@inertiajs/react';
import { Tag } from 'primereact/tag';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActivityTab from '@/Components/Project/ActivityTab';
import FilesTab from '@/Components/Project/FilesTab';
import OverviewTab from '@/Components/Project/OverviewTab';
import SharesTab from '@/Components/Project/SharesTab';
import { priorityMeta, statusMeta } from '@/Components/Project/projectMeta';
import {
    ChartBarIcon,
    ChevronRight,
    CloudArrowUpIcon,
    FolderIcon,
    LinkIcon,
    ShareIcon,
    Squares2X2Icon,
    UserIcon,
} from '@/Components/Icons';
import { formatNumber, timeAgo } from '@/utils/format';

const TABS = [
    { key: 'overview', label: 'Aperçu', icon: Squares2X2Icon },
    { key: 'files', label: 'Fichiers', icon: FolderIcon, countKey: 'total_files' },
    { key: 'activity', label: 'Activité', icon: ChartBarIcon, countKey: 'logs_count' },
    { key: 'shares', label: 'Partages', icon: LinkIcon, countKey: 'accesses_count' },
];

export default function ProjectShow({
    auth,
    project,
    team,
    stats,
    tab = 'overview',
    canManage = false,
    canManageMembers = false,
    canUpload = false,
    members = [],
    teamMembers = [],
    recentFiles = [],
    recentLogs = [],
    comments = [],
    files = null,
    folders = [],
    currentFolder = null,
    breadcrumb = [],
    folderOptions = [],
    filters = {},
    logs = null,
    activitySummary = { total: 0, by_action: [] },
    accesses = [],
    clients = [],
}) {
    const status = statusMeta(project.status);
    const priority = priorityMeta(project.priority);

    const openTab = (key, extra = {}) => {
        if (key === tab) {
            return;
        }

        router.get(
            route('projects.show', project.id),
            { tab: key, ...extra },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${project.title} - TASHO`} />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* Fil d'Ariane */}
                <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
                    <Link
                        href={route('projects.index')}
                        className="rounded-md px-1 py-0.5 font-medium text-gray-500 transition hover:text-gray-800"
                    >
                        Projets
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                    <span className="truncate font-medium text-gray-900">{project.title}</span>
                </nav>

                {/* En-tête du projet */}
                <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-gray-900">
                                {project.title}
                            </h1>

                            <Tag
                                value={status.label}
                                severity={status.severity}
                                rounded
                                className="!px-2.5 !py-0.5 !text-[11px] !font-medium"
                            />

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                                <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                                Priorité {priority.label.toLowerCase()}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                                <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                                {project.client_name || 'Aucun client associé'}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <span className="text-gray-400">Propriétaire</span>
                                <span className="font-medium text-gray-700">
                                    {project.owner?.name || '—'}
                                </span>
                            </span>

                            <span className="text-gray-400">
                                Mis à jour {timeAgo(project.updated_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => openTab('shares')}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                <ShareIcon className="h-4 w-4" />
                                Partager
                            </button>
                        )}

                        {canUpload && (
                            <button
                                type="button"
                                onClick={() => openTab('files')}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                            >
                                <CloudArrowUpIcon className="h-4 w-4" />
                                Gérer les fichiers
                            </button>
                        )}
                    </div>
                </header>

                {/* Onglets */}
                <div className="rounded-xl border border-gray-200 bg-white px-2 shadow-sm">
                    <nav
                        role="tablist"
                        aria-label="Sections du projet"
                        className="-mb-px flex gap-1 overflow-x-auto"
                    >
                        {TABS.map((item) => {
                            const Icon = item.icon;
                            const active = tab === item.key;
                            const count = item.countKey ? stats[item.countKey] : null;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => openTab(item.key)}
                                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-sm font-medium transition ${
                                        active
                                            ? 'border-tasho-primary text-tasho-primary'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}

                                    {count !== null && (
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                                                active
                                                    ? 'bg-tasho-primary/10 text-tasho-primary'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {formatNumber(count)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Contenu de l'onglet */}
                {tab === 'overview' && (
                    <OverviewTab
                        project={project}
                        stats={stats}
                        members={members}
                        teamMembers={teamMembers}
                        recentFiles={recentFiles}
                        recentLogs={recentLogs}
                        comments={comments}
                        canManageMembers={canManageMembers}
                        onOpenTab={openTab}
                    />
                )}

                {tab === 'files' && files && (
                    <FilesTab
                        project={project}
                        files={files}
                        folders={folders}
                        currentFolder={currentFolder}
                        breadcrumb={breadcrumb}
                        filters={filters}
                        folderOptions={folderOptions}
                        canManage={canManage}
                        canUpload={canUpload}
                    />
                )}

                {tab === 'activity' && logs && (
                    <ActivityTab
                        project={project}
                        logs={logs}
                        activitySummary={activitySummary}
                        filters={filters}
                    />
                )}

                {tab === 'shares' && (
                    <SharesTab
                        project={project}
                        accesses={accesses}
                        clients={clients}
                        canManage={canManage}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
