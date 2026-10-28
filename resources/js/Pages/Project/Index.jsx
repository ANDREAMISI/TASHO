import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatsCard from '@/Components/Dashboard/StatsCard';
import Pagination from '@/Components/Project/Pagination';
import { priorityMeta, statusMeta } from '@/Components/Project/projectMeta';
import {
    CloudIcon,
    DocumentIcon,
    FolderIcon,
    FolderOpenIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserGroupIcon,
} from '@/Components/Icons';
import { formatBytes, formatNumber, plural, timeAgo } from '@/utils/format';

const SORT_OPTIONS = [
    { value: 'recent', label: 'Dernière activité' },
    { value: 'created', label: 'Création récente' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'name', label: 'Nom (A–Z)' },
];

const PRIORITY_OPTIONS = [
    { value: 'high', label: 'Priorité haute' },
    { value: 'medium', label: 'Priorité moyenne' },
    { value: 'low', label: 'Priorité basse' },
];

const STATUS_TABS = [
    { value: '', label: 'Tous', countKey: 'projects' },
    { value: 'active', label: 'Actifs', countKey: 'active' },
    { value: 'completed', label: 'Terminés', countKey: 'completed' },
    { value: 'draft', label: 'Brouillons', countKey: 'draft' },
    { value: 'archived', label: 'Archivés', countKey: 'archived' },
];

function ProjectCard({ project }) {
    const status = statusMeta(project.status);
    const priority = priorityMeta(project.priority);

    return (
        <Link
            href={route('projects.show', project.id)}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-tasho-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary focus-visible:ring-offset-2"
        >
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tasho-primary/10 text-tasho-primary">
                    <FolderOpenIcon className="h-5 w-5" />
                </span>

                <Tag
                    value={status.label}
                    severity={status.severity}
                    rounded
                    className="!px-2.5 !py-0.5 !text-[11px] !font-medium"
                />
            </div>

            <div className="px-5 pt-3">
                <h2 className="truncate text-base font-semibold text-gray-900 group-hover:text-tasho-primary">
                    {project.title}
                </h2>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                    {project.client_name || 'Aucun client associé'}
                </p>

                <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-600">
                    {project.description || 'Aucune description pour ce projet.'}
                </p>
            </div>

            <div className="mt-auto space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                        <DocumentIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="tabular-nums">{formatNumber(project.files_count)}</span>
                        {project.files_count > 1 ? 'fichiers' : 'fichier'}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                        <FolderIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="tabular-nums">{formatNumber(project.folders_count)}</span>
                        {project.folders_count > 1 ? 'dossiers' : 'dossier'}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                        <UserGroupIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="tabular-nums">{formatNumber(project.members_count)}</span>
                        {project.members_count > 1 ? 'membres' : 'membre'}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                        <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                        <span className="text-gray-300">·</span>
                        <span className="font-normal text-gray-500">
                            {formatBytes(project.files_size)}
                        </span>
                    </span>

                    <span className="whitespace-nowrap text-gray-400">
                        {timeAgo(project.updated_at)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function ProjectIndex({ auth, projects, filters, summary, team }) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const visit = (overrides = {}) => {
        const params = {
            search: overrides.search !== undefined ? overrides.search : filters.search,
            status: overrides.status !== undefined ? overrides.status : filters.status,
            priority: overrides.priority !== undefined ? overrides.priority : filters.priority,
            sort: overrides.sort !== undefined ? overrides.sort : filters.sort,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) {
                delete params[key];
            }
        });

        router.get(route('projects.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submitSearch = (event) => {
        event.preventDefault();
        visit({ search: search.trim() });
    };

    const selectStatus = (status) => {
        if (status === filters.status) {
            return;
        }

        visit({ status });
    };

    const selectPriority = (value) => {
        if ((value || '') === filters.priority) {
            return;
        }

        visit({ priority: value || '' });
    };

    const selectSort = (value) => {
        if ((value || 'recent') === filters.sort) {
            return;
        }

        visit({ sort: value || 'recent' });
    };

    const resetFilters = () => {
        setSearch('');
        visit({ search: '', status: '', priority: '' });
    };

    const hasFilters = Boolean(filters.search || filters.status || filters.priority);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Projets - TASHO" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* En-tête */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Projets
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Organisez, partagez et suivez les fichiers de{' '}
                            <span className="font-medium text-gray-700">{team?.name}</span>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('projects.create')}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary focus-visible:ring-offset-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nouveau projet
                        </Link>
                    </div>
                </header>

                {/* Indicateurs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatsCard
                        label="Projets"
                        value={formatNumber(summary.projects)}
                        icon={FolderIcon}
                        accent="indigo"
                        hint={`${plural(summary.active, 'projet actif', 'projets actifs')} · ${plural(
                            summary.completed,
                            'terminé',
                            'terminés',
                        )}`}
                    />

                    <StatsCard
                        label="Fichiers"
                        value={formatNumber(summary.files)}
                        icon={DocumentIcon}
                        accent="sky"
                        hint={`répartis dans ${plural(summary.folders, 'dossier', 'dossiers')}`}
                    />

                    <StatsCard
                        label="Stockage utilisé"
                        value={formatBytes(summary.storage)}
                        icon={CloudIcon}
                        accent="amber"
                        hint="sur l'ensemble de vos projets"
                    />

                    <StatsCard
                        label="Liens de partage"
                        value={formatNumber(summary.shares)}
                        icon={LinkIcon}
                        accent="emerald"
                        hint="créés pour vos projets"
                    />
                </div>

                {/* Filtres */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
                        <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Rechercher un projet, un client…"
                                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-tasho-primary focus:outline-none focus:ring-2 focus:ring-tasho-primary/20"
                            />
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <Dropdown
                                value={filters.priority || ''}
                                options={PRIORITY_OPTIONS}
                                onChange={(event) => selectPriority(event.value)}
                                placeholder="Toutes les priorités"
                                className="w-full sm:w-52"
                            />

                            <Dropdown
                                value={filters.sort || 'recent'}
                                options={SORT_OPTIONS}
                                onChange={(event) => selectSort(event.value)}
                                className="w-full sm:w-48"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3">
                        {STATUS_TABS.map((tab) => {
                            const active = (filters.status || '') === tab.value;
                            const count = summary[tab.countKey] || 0;

                            return (
                                <button
                                    key={tab.value || 'all'}
                                    type="button"
                                    onClick={() => selectStatus(tab.value)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                        active
                                            ? 'bg-tasho-primary text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-white text-gray-500'
                                        }`}
                                    >
                                        {formatNumber(count)}
                                    </span>
                                </button>
                            );
                        })}

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="ml-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                </section>

                {/* Résultats */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">
                        {plural(projects.total, 'projet', 'projets')}
                        {hasFilters ? ' correspondant aux filtres' : ''}
                    </p>
                </div>

                {projects.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {projects.data.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FolderOpenIcon className="h-7 w-7" />
                        </span>

                        <p className="mt-4 text-sm font-medium text-gray-900">
                            {hasFilters
                                ? 'Aucun projet ne correspond à vos filtres'
                                : 'Aucun projet pour le moment'}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            {hasFilters
                                ? 'Modifiez la recherche ou réinitialisez les filtres.'
                                : 'Créez votre premier projet pour organiser et partager des fichiers.'}
                        </p>

                        {hasFilters ? (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-4 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                Effacer les filtres
                            </button>
                        ) : (
                            <Link
                                href={route('projects.create')}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Créer un projet
                            </Link>
                        )}
                    </div>
                )}

                <Pagination paginator={projects} />
            </div>
        </AuthenticatedLayout>
    );
}
