import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import { Dropdown } from 'primereact/dropdown';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Pagination from '@/Components/Project/Pagination';
import { activityMeta } from '@/Components/Project/projectMeta';
import {
    ChartBarIcon,
    ClockIcon,
    DocumentIcon,
    FolderIcon,
    MagnifyingGlassIcon,
    UserIcon,
    UsersIcon,
} from '@/Components/Icons';
import { formatDate, formatNumber, plural, timeAgo } from '@/utils/format';

const STAT_TONES = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
};

const DETAIL_LABELS = {
    client_name: 'Client',
    client_email: 'Email',
    visitor_name: 'Visiteur',
    visitor_email: 'Email',
    name: 'Nom',
    email: 'Email',
    role: 'Rôle',
    status: 'Statut',
    expires_at: 'Expiration',
    can_download: 'Téléchargement',
    can_comment: 'Commentaires',
    can_favorite: 'Favoris',
    file_name: 'Fichier',
    project_name: 'Projet',
};

/** Détails internes ou redondants avec l'acteur, jamais affichés. */
const HIDDEN_DETAILS = new Set([
    'access_id',
    'client_id',
    'visitor_name',
    'visitor_email',
    'ip',
    'user_agent',
]);

function StatTile({ icon: Icon, label, value, hint, tone = 'indigo' }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    STAT_TONES[tone] || STAT_TONES.indigo
                }`}
            >
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-500">{label}</p>
                <p className="text-xl font-semibold tracking-tight text-gray-900 tabular-nums">
                    {value}
                </p>
                {hint && <p className="mt-0.5 truncate text-[11px] text-gray-400">{hint}</p>}
            </div>
        </div>
    );
}

function initialsOf(name) {
    return (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

function shortDate(value) {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(
        new Date(`${value}T12:00:00`),
    );
}

function dayLabel(value) {
    if (!value) {
        return 'Date inconnue';
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const iso = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate(),
        ).padStart(2, '0')}`;

    if (value === iso(today)) {
        return "Aujourd'hui";
    }

    if (value === iso(yesterday)) {
        return 'Hier';
    }

    return formatDate(value);
}

function ActivityTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null;
    }

    const day = payload[0].payload;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-medium text-gray-900">{formatDate(day.date)}</p>
            <p className="mt-0.5 text-gray-500">
                {plural(day.count, 'événement', 'événements')}
            </p>
        </div>
    );
}

function DailyChart({ series = [] }) {
    const data = useMemo(
        () => series.map((day) => ({ ...day, label: shortDate(day.date) })),
        [series],
    );

    const total = useMemo(() => data.reduce((sum, day) => sum + day.count, 0), [data]);

    const peak = useMemo(
        () =>
            data.reduce(
                (best, day) => (day.count > (best?.count ?? 0) ? day : best),
                null,
            ),
        [data],
    );

    return (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-2 px-5 pt-4">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                        Activité quotidienne
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">30 derniers jours</p>
                </div>

                {total > 0 && peak && (
                    <p className="text-right text-xs text-gray-500">
                        Pic le{' '}
                        <span className="font-medium text-gray-700">{shortDate(peak.date)}</span>
                        <br />
                        {plural(peak.count, 'événement', 'événements')}
                    </p>
                )}
            </header>

            {total === 0 ? (
                <div className="mx-5 mb-4 mt-3 flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
                    <ChartBarIcon className="h-7 w-7 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-600">
                        Aucune activité sur les 30 derniers jours
                    </p>
                </div>
            ) : (
                <div className="h-40 px-2 pb-2 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="activity-page-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1B9CD8" stopOpacity={0.22} />
                                    <stop offset="100%" stopColor="#1B9CD8" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#F3F4F6"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={28}
                            />
                            <YAxis
                                allowDecimals={false}
                                width={34}
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, (max) => Math.max(2, Math.ceil(max * 1.15))]}
                            />
                            <Tooltip
                                content={<ActivityTooltip />}
                                cursor={{ stroke: '#D1D5DB', strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Événements"
                                stroke="#1B9CD8"
                                strokeWidth={2}
                                fill="url(#activity-page-fill)"
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

function DetailsChips({ details, actor, actorEmail }) {
    if (!details || typeof details !== 'object') {
        return null;
    }

    const entries = Object.entries(details)
        .filter(([key, value]) => {
            if (HIDDEN_DETAILS.has(key) || value === null || value === '') {
                return false;
            }

            if (key === 'visitor_name' && value === actor) {
                return false;
            }

            if (key === 'visitor_email' && value === actorEmail) {
                return false;
            }

            return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
        })
        .slice(0, 3);

    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
            {entries.map(([key, value]) => (
                <span
                    key={key}
                    className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-inset ring-gray-200"
                >
                    <span className="font-medium text-gray-500">
                        {DETAIL_LABELS[key] || key} :
                    </span>
                    <span className="truncate">
                        {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
                    </span>
                </span>
            ))}
        </div>
    );
}

export default function ActivityIndex({ logs, stats = {}, filters = {}, actions = {}, projects = [], users = [], team = null }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const activeFiltersCount =
        ['action', 'user_id', 'project_id', 'date_from', 'date_to'].filter(
            (key) => filters[key],
        ).length + (filters.search ? 1 : 0);

    const applyFilters = (changes = {}) => {
        const next = { ...filters, ...changes };

        Object.keys(next).forEach((key) => {
            if (next[key] === null || next[key] === '' || next[key] === undefined) {
                delete next[key];
            }
        });

        router.get(route('activity.index'), next, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const resetFilters = () => {
        setSearch('');
        router.get(route('activity.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        applyFilters({ search: search.trim() || null });
    };

    const exportLogs = () => {
        const params = { ...filters };

        Object.keys(params).forEach((key) => {
            if (params[key] === null || params[key] === '') {
                delete params[key];
            }
        });

        window.open(route('activity.export', params), '_blank');
    };

    const actionOptions = useMemo(
        () =>
            Object.entries(actions).map(([value, label]) => ({
                value,
                label,
            })),
        [actions],
    );

    const userOptions = useMemo(
        () => [
            ...users.map((member) => ({ value: String(member.id), label: member.name })),
            { value: 'anonymous', label: 'Visiteurs anonymes' },
        ],
        [users],
    );

    const projectOptions = useMemo(
        () => projects.map((project) => ({ value: String(project.id), label: project.title })),
        [projects],
    );

    const groups = useMemo(() => {
        return (logs?.data || []).reduce((accumulator, log) => {
            const key = log.created_at ? log.created_at.slice(0, 10) : 'unknown';
            (accumulator[key] = accumulator[key] || []).push(log);

            return accumulator;
        }, {});
    }, [logs?.data]);

    const participants =
        (stats.members || 0) + (stats.visitors || 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Activité - TASHO" />

            <div className={`mx-auto w-full max-w-6xl space-y-5 ${processing ? 'opacity-70' : ''}`}>
                {/* En-tête */}
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tasho-primary/10 text-tasho-primary">
                            <ChartBarIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Activité
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {team?.name ? `Journal de ${team.name}` : 'Journal de votre espace'} ·
                                consultations, téléchargements, partages et gestion des clients.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        label="Exporter"
                        icon="pi pi-download"
                        variant="secondary"
                        onClick={exportLogs}
                    />
                </header>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatTile
                        icon={ChartBarIcon}
                        label="Actions"
                        value={formatNumber(stats.total)}
                        hint="depuis le début"
                        tone="indigo"
                    />
                    <StatTile
                        icon={ClockIcon}
                        label="Aujourd'hui"
                        value={formatNumber(stats.today)}
                        hint="événements enregistrés"
                        tone="sky"
                    />
                    <StatTile
                        icon={UsersIcon}
                        label="Participants"
                        value={formatNumber(participants)}
                        hint={`${formatNumber(stats.members)} membre${
                            stats.members === 1 ? '' : 's'
                        } · ${formatNumber(stats.visitors)} visiteur${
                            stats.visitors === 1 ? '' : 's'
                        }`}
                        tone="emerald"
                    />
                    <StatTile
                        icon={FolderIcon}
                        label="Projets concernés"
                        value={formatNumber(stats.projects)}
                        hint="depuis le début"
                        tone="amber"
                    />
                </div>

                {/* Graphique */}
                <DailyChart series={stats.daily || []} />

                {/* Filtres */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
                        <h2 className="text-sm font-semibold text-gray-900">Filtres</h2>

                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-xs font-medium text-tasho-primary transition hover:text-tasho-primary/80"
                            >
                                Réinitialiser ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    <div className="space-y-3 px-5 py-4">
                        <form onSubmit={handleSearch} className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Rechercher un membre, un projet, un fichier, un client…"
                                aria-label="Rechercher dans l'activité"
                                className="w-full rounded-[5px] border border-gray-300 py-2 pl-9 pr-24 text-sm text-gray-900 placeholder:text-gray-400 focus:border-tasho-primary focus:outline-none focus:ring-1 focus:ring-tasho-primary"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[5px] bg-tasho-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-tasho-primary/90"
                            >
                                Rechercher
                            </button>
                        </form>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label
                                    htmlFor="filter-action"
                                    className="mb-1 block text-xs font-medium text-gray-500"
                                >
                                    Action
                                </label>
                                <Dropdown
                                    inputId="filter-action"
                                    value={filters.action || null}
                                    options={actionOptions}
                                    onChange={(event) =>
                                        applyFilters({ action: event.value || null })
                                    }
                                    placeholder="Toutes les actions"
                                    showClear
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="filter-user"
                                    className="mb-1 block text-xs font-medium text-gray-500"
                                >
                                    Utilisateur
                                </label>
                                <Dropdown
                                    inputId="filter-user"
                                    value={filters.user_id || null}
                                    options={userOptions}
                                    onChange={(event) =>
                                        applyFilters({ user_id: event.value || null })
                                    }
                                    placeholder="Tous les participants"
                                    showClear
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="filter-project"
                                    className="mb-1 block text-xs font-medium text-gray-500"
                                >
                                    Projet
                                </label>
                                <Dropdown
                                    inputId="filter-project"
                                    value={filters.project_id || null}
                                    options={projectOptions}
                                    onChange={(event) =>
                                        applyFilters({ project_id: event.value || null })
                                    }
                                    placeholder="Tous les projets"
                                    showClear
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <span className="mb-1 block text-xs font-medium text-gray-500">
                                    Période
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="date"
                                        value={filters.date_from || ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                date_from: event.target.value || null,
                                            })
                                        }
                                        aria-label="Date de début"
                                        className="min-w-0 flex-1 rounded-[5px] border border-gray-300 px-2 py-2 text-xs text-gray-700 focus:border-tasho-primary focus:outline-none focus:ring-1 focus:ring-tasho-primary"
                                    />
                                    <span className="shrink-0 text-xs text-gray-400">→</span>
                                    <input
                                        type="date"
                                        value={filters.date_to || ''}
                                        onChange={(event) =>
                                            applyFilters({
                                                date_to: event.target.value || null,
                                            })
                                        }
                                        aria-label="Date de fin"
                                        className="min-w-0 flex-1 rounded-[5px] border border-gray-300 px-2 py-2 text-xs text-gray-700 focus:border-tasho-primary focus:outline-none focus:ring-1 focus:ring-tasho-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions rapides */}
                {stats.by_action?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => applyFilters({ action: null })}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                !filters.action
                                    ? 'bg-tasho-primary text-white shadow-sm'
                                    : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Toutes les actions
                            <span
                                className={`rounded-full px-1.5 text-[11px] ${
                                    !filters.action
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {formatNumber(stats.total)}
                            </span>
                        </button>

                        {stats.by_action.map((item) => {
                            const meta = activityMeta(item.action);
                            const Icon = meta.icon;
                            const active = filters.action === item.action;

                            return (
                                <button
                                    key={item.action}
                                    type="button"
                                    onClick={() => applyFilters({ action: item.action })}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                        active
                                            ? 'bg-tasho-primary text-white shadow-sm'
                                            : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                    <span
                                        className={`rounded-full px-1.5 text-[11px] ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {formatNumber(item.count)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Journal */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {logs?.data?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {Object.entries(groups).map(([day, items]) => (
                                <div key={day} className="px-5 py-4">
                                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        {dayLabel(day)}
                                    </h2>

                                    <ul className="space-y-4">
                                        {items.map((log) => {
                                            const meta = activityMeta(log.action);
                                            const Icon = meta.icon;
                                            const time = log.created_at
                                                ? new Date(log.created_at).toLocaleTimeString(
                                                      'fr-FR',
                                                      {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      },
                                                  )
                                                : '';

                                            return (
                                                <li key={log.id} className="flex gap-3">
                                                    <div className="relative shrink-0">
                                                        <Avatar
                                                            image={log.actor_avatar || undefined}
                                                            label={
                                                                log.actor_avatar
                                                                    ? undefined
                                                                    : log.is_anonymous
                                                                      ? '?'
                                                                      : initialsOf(log.actor)
                                                            }
                                                            imageAlt={log.actor}
                                                            shape="circle"
                                                            className={`!h-9 !w-9 !text-xs !font-semibold ${
                                                                log.is_anonymous
                                                                    ? '!bg-gray-100 !text-gray-500'
                                                                    : '!bg-tasho-primary !text-white'
                                                            }`}
                                                        />
                                                        <span
                                                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${meta.tone}`}
                                                        >
                                                            <Icon className="h-3 w-3" />
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-sm leading-5 text-gray-700">
                                                                <span className="font-medium text-gray-900">
                                                                    {log.actor}
                                                                </span>{' '}
                                                                <span className="text-gray-500">
                                                                    · {log.action_label}
                                                                </span>
                                                                {log.file && (
                                                                    <>
                                                                        {' '}
                                                                        <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                                                                            <DocumentIcon className="h-3.5 w-3.5 text-gray-400" />
                                                                            {log.file.name}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>

                                                            <span
                                                                className="shrink-0 text-xs text-gray-400 tabular-nums"
                                                                title={timeAgo(log.created_at)}
                                                            >
                                                                {time}
                                                            </span>
                                                        </div>

                                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                                                            {log.project && (
                                                                <Link
                                                                    href={route(
                                                                        'projects.show',
                                                                        log.project.id,
                                                                    )}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-tasho-primary/5 px-1.5 py-0.5 font-medium text-tasho-primary transition hover:bg-tasho-primary/10"
                                                                >
                                                                    <FolderIcon className="h-3 w-3" />
                                                                    {log.project.title}
                                                                </Link>
                                                            )}

                                                            {log.client && (
                                                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-gray-500 ring-1 ring-inset ring-gray-200">
                                                                    <UserIcon className="h-3 w-3" />
                                                                    {log.client.name}
                                                                </span>
                                                            )}

                                                            {log.actor_email && (
                                                                <span className="truncate">
                                                                    {log.actor_email}
                                                                </span>
                                                            )}

                                                            <span>{timeAgo(log.created_at)}</span>
                                                        </div>

                                                        <DetailsChips
                                                            details={log.details}
                                                            actor={log.actor}
                                                            actorEmail={log.actor_email}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                <ChartBarIcon className="h-7 w-7" />
                            </span>
                            <p className="mt-4 text-sm font-medium text-gray-900">
                                Aucune activité
                                {activeFiltersCount > 0 ? ' pour ces filtres' : ''}
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-gray-500">
                                {activeFiltersCount > 0
                                    ? 'Élargissez la période ou réinitialisez les filtres pour retrouver vos événements.'
                                    : 'Les consultations, téléchargements, partages et actions sur les clients apparaîtront ici.'}
                            </p>

                            {activeFiltersCount > 0 && (
                                <Button
                                    type="button"
                                    label="Réinitialiser les filtres"
                                    icon="pi pi-filter-slash"
                                    variant="secondary"
                                    className="mt-4"
                                    onClick={resetFilters}
                                />
                            )}
                        </div>
                    )}

                    <div className="px-5 pb-4">
                        <Pagination paginator={logs} />
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
