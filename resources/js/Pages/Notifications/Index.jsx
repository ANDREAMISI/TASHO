import { useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Pagination from '@/Components/Project/Pagination';
import NotificationRow from '@/Components/Notifications/NotificationRow';
import { BellIcon, CheckIcon, ClockIcon, FunnelIcon } from '@/Components/Icons';
import { formatDate, formatNumber, plural } from '@/utils/format';

const STAT_TONES = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
};

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
                    {formatNumber(value)}
                </p>
                {hint && <p className="mt-0.5 truncate text-[11px] text-gray-400">{hint}</p>}
            </div>
        </div>
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

export default function NotificationsIndex({
    auth,
    notifications,
    stats = {},
    filters = {},
    types = {},
}) {
    const activeFiltersCount =
        (filters.status ? 1 : 0) + (filters.type ? 1 : 0);

    const applyFilters = (changes = {}) => {
        const next = { status: filters.status, type: filters.type, ...changes };

        Object.keys(next).forEach((key) => {
            if (next[key] === null || next[key] === '' || next[key] === undefined) {
                delete next[key];
            }
        });

        router.get(route('notifications.index'), next, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        router.get(route('notifications.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const markAsRead = (notification) => {
        router.post(route('notifications.read', notification.id), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const destroy = (notification) => {
        router.delete(route('notifications.destroy', notification.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const typeOptions = useMemo(
        () => Object.entries(types).map(([value, label]) => ({ value, label })),
        [types],
    );

    const statusOptions = useMemo(
        () => [
            { value: null, label: 'Toutes', count: stats.total ?? 0 },
            { value: 'unread', label: 'Non lues', count: stats.unread ?? 0 },
            {
                value: 'read',
                label: 'Lues',
                count: Math.max((stats.total ?? 0) - (stats.unread ?? 0), 0),
            },
        ],
        [stats.total, stats.unread],
    );

    const groups = useMemo(
        () =>
            (notifications?.data || []).reduce((accumulator, notification) => {
                const key = notification.created_at
                    ? notification.created_at.slice(0, 10)
                    : 'unknown';
                (accumulator[key] = accumulator[key] || []).push(notification);

                return accumulator;
            }, {}),
        [notifications?.data],
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Notifications - TASHO" />

            <div className="mx-auto w-full max-w-5xl space-y-5">
                {/* En-tête */}
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tasho-primary/10 text-tasho-primary">
                            <BellIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Notifications
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Suivez les commentaires, partages et changements qui
                                concernent votre espace.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        label="Tout marquer comme lu"
                        icon="pi pi-check"
                        variant="secondary"
                        disabled={!stats.unread}
                        onClick={markAllAsRead}
                    />
                </header>

                {/* Statistiques */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatTile
                        icon={BellIcon}
                        label="Non lues"
                        value={stats.unread}
                        hint={
                            stats.unread > 0
                                ? 'à découvrir maintenant'
                                : 'vous êtes à jour'
                        }
                        tone="indigo"
                    />
                    <StatTile
                        icon={ClockIcon}
                        label="Aujourd'hui"
                        value={stats.today}
                        hint={plural(stats.today, 'notification reçue', 'notifications reçues')}
                        tone="sky"
                    />
                    <StatTile
                        icon={CheckIcon}
                        label="Total"
                        value={stats.total}
                        hint="depuis le début"
                        tone="emerald"
                    />
                </div>

                {/* Filtres */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <FunnelIcon className="h-4 w-4 text-gray-400" />
                            Filtres
                        </h2>

                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs font-medium text-tasho-primary transition hover:text-tasho-primary/80"
                            >
                                Réinitialiser ({activeFiltersCount})
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((status) => {
                                const active = (filters.status || null) === status.value;

                                return (
                                    <button
                                        key={status.label}
                                        type="button"
                                        onClick={() =>
                                            applyFilters({ status: status.value })
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                            active
                                                ? 'bg-tasho-primary text-white shadow-sm'
                                                : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {status.label}
                                        <span
                                            className={`rounded-full px-1.5 text-[11px] ${
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {formatNumber(status.count)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-full sm:w-56">
                            <label
                                htmlFor="notification-type"
                                className="mb-1 block text-xs font-medium text-gray-500"
                            >
                                Type
                            </label>
                            <Dropdown
                                inputId="notification-type"
                                value={filters.type || null}
                                options={typeOptions}
                                onChange={(event) =>
                                    applyFilters({ type: event.value || null })
                                }
                                placeholder="Tous les types"
                                showClear
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Journal */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {notifications?.data?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {Object.entries(groups).map(([day, items]) => (
                                <div key={day}>
                                    <h2 className="bg-gray-50/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                        {dayLabel(day)}
                                    </h2>

                                    <ul className="divide-y divide-gray-100">
                                        {items.map((notification) => (
                                            <li key={notification.id}>
                                                <NotificationRow
                                                    notification={notification}
                                                    onRead={markAsRead}
                                                    onDelete={destroy}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                <BellIcon className="h-7 w-7" />
                            </span>
                            <p className="mt-4 text-sm font-medium text-gray-900">
                                Aucune notification
                                {activeFiltersCount > 0 ? ' pour ces filtres' : ' pour le moment'}
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-gray-500">
                                {activeFiltersCount > 0
                                    ? 'Changez de filtre pour retrouver vos notifications.'
                                    : 'Les commentaires de vos clients, les consultations de vos partages et les changements d’équipe apparaîtront ici.'}
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
                        <Pagination paginator={notifications} />
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
