import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatsCard from '@/Components/Dashboard/StatsCard';
import Pagination from '@/Components/Project/Pagination';
import FolderIllustration from '@/Components/Project/FolderIllustration';
import ProjectFormModal from '@/Components/Project/ProjectFormModal';
import {
    ChartBarIcon,
    CloudIcon,
    DocumentIcon,
    EllipsisHorizontalIcon,
    FolderIcon,
    FolderOpenIcon,
    InformationCircleIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ShareIcon,
    TrashIcon,
} from '@/Components/Icons';
import { formatBytes, formatNumber, plural } from '@/utils/format';

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

function menuItemClasses(focus, danger = false) {
    if (danger) {
        return `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition ${
            focus ? 'bg-red-50' : ''
        }`;
    }

    return `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition ${
        focus ? 'bg-gray-50 text-gray-900' : ''
    }`;
}

function ProjectTile({ project }) {
    const canManage = Boolean(project.is_owner);

    const projectUrl = (tab) =>
        route('projects.show', tab ? { project: project.id, tab } : project.id);

    const deleteProject = () => {
        confirmDialog({
            message: `Supprimer le projet « ${project.title} » ? Cette action est définitive.`,
            header: 'Supprimer le projet',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('projects.destroy', project.id), {
                    preserveScroll: true,
                }),
        });
    };

    return (
        <div className="group flex flex-col items-center">
            <div className="relative">
                <Link
                    href={projectUrl()}
                    className="flex items-center justify-center rounded-2xl p-2 transition hover:bg-amber-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
                >
                    <FolderIllustration
                        filled={project.files_count > 0}
                        className="h-24 w-auto drop-shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.03] sm:h-28"
                    />
                </Link>

                <Menu as="div" className="absolute -right-2 -top-2 z-20">
                    <MenuButton
                        aria-label={`Actions pour ${project.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm ring-1 ring-gray-200/70 transition hover:bg-white hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40 data-[open]:bg-white data-[open]:text-gray-700"
                    >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                    </MenuButton>

                    <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems className="absolute right-0 z-50 mt-1 w-52 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg focus:outline-none">
                            <MenuItem>
                                {({ focus }) => (
                                    <Link href={projectUrl()} className={menuItemClasses(focus)}>
                                        <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                                        Informations
                                    </Link>
                                )}
                            </MenuItem>

                            <MenuItem>
                                {({ focus }) => (
                                    <Link
                                        href={projectUrl('files')}
                                        className={menuItemClasses(focus)}
                                    >
                                        <FolderOpenIcon className="h-4 w-4 text-gray-400" />
                                        Fichiers
                                    </Link>
                                )}
                            </MenuItem>

                            <MenuItem>
                                {({ focus }) => (
                                    <Link
                                        href={projectUrl('activity')}
                                        className={menuItemClasses(focus)}
                                    >
                                        <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                        Activité
                                    </Link>
                                )}
                            </MenuItem>

                            {canManage && (
                                <>
                                    <div className="my-1 h-px bg-gray-100" />

                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href={projectUrl('shares')}
                                                className={menuItemClasses(focus)}
                                            >
                                                <ShareIcon className="h-4 w-4 text-gray-400" />
                                                Partager
                                            </Link>
                                        )}
                                    </MenuItem>

                                    <MenuItem>
                                        {({ focus }) => (
                                            <button
                                                type="button"
                                                onClick={deleteProject}
                                                className={menuItemClasses(focus, true)}
                                            >
                                                <TrashIcon className="h-4 w-4 text-red-500" />
                                                Supprimer
                                            </button>
                                        )}
                                    </MenuItem>
                                </>
                            )}
                        </MenuItems>
                    </Transition>
                </Menu>
            </div>

            <Link
                href={projectUrl()}
                className="mt-2 line-clamp-2 max-w-[11rem] text-center text-sm font-medium leading-snug text-gray-900 transition hover:text-tasho-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
            >
                {project.title}
            </Link>
        </div>
    );
}

export default function ProjectIndex({
    auth,
    projects,
    filters,
    summary,
    team,
    clients = [],
    openCreate = false,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [createOpen, setCreateOpen] = useState(Boolean(openCreate));

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    useEffect(() => {
        if (openCreate) {
            setCreateOpen(true);
        }
    }, [openCreate]);

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
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary focus-visible:ring-offset-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nouveau projet
                        </button>
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                        {projects.data.map((project) => (
                            <ProjectTile key={project.id} project={project} />
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
                            <button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Créer un projet
                            </button>
                        )}
                    </div>
                )}

                <Pagination paginator={projects} />
            </div>

            <ProjectFormModal
                visible={createOpen}
                onHide={() => setCreateOpen(false)}
                clients={clients}
                teamName={team?.name}
            />

            <ConfirmDialog />
        </AuthenticatedLayout>
    );
}
