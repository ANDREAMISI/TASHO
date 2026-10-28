import { router } from '@inertiajs/react';
import Pagination from './Pagination';
import { activityMeta } from './projectMeta';
import { EyeIcon } from '@/Components/Icons';
import { formatDate, formatNumber, plural, timeAgo } from '@/utils/format';

export default function ActivityTab({ project, logs, activitySummary, filters = {} }) {
    const activeAction = filters.action || '';

    const selectAction = (action) => {
        const params = { tab: 'activity' };

        if (action) {
            params.action = action;
        }

        router.get(route('projects.show', project.id), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const groups = (logs?.data || []).reduce((accumulator, log) => {
        const key = log.created_at ? log.created_at.slice(0, 10) : 'unknown';
        (accumulator[key] = accumulator[key] || []).push(log);

        return accumulator;
    }, {});

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            Journal d'activité
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {plural(activitySummary.total, 'événement enregistré', 'événements enregistrés')}
                        </p>
                    </div>
                </header>

                <div className="flex flex-wrap gap-2 px-5 py-4">
                    <button
                        type="button"
                        onClick={() => selectAction('')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            activeAction === ''
                                ? 'bg-tasho-primary text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Toutes les actions
                        <span
                            className={`rounded-full px-1.5 text-[11px] ${
                                activeAction === ''
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white text-gray-500'
                            }`}
                        >
                            {formatNumber(activitySummary.total)}
                        </span>
                    </button>

                    {activitySummary.by_action.map((item) => {
                        const meta = activityMeta(item.action);
                        const Icon = meta.icon;
                        const active = activeAction === item.action;

                        return (
                            <button
                                key={item.action}
                                type="button"
                                onClick={() => selectAction(item.action)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                    active
                                        ? 'bg-tasho-primary text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                                <span
                                    className={`rounded-full px-1.5 text-[11px] ${
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-white text-gray-500'
                                    }`}
                                >
                                    {formatNumber(item.count)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {logs.data.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {Object.entries(groups).map(([day, items]) => (
                            <div key={day} className="px-5 py-4">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    {day === 'unknown' ? 'Date inconnue' : formatDate(day)}
                                </h3>

                                <ul className="space-y-4">
                                    {items.map((log) => {
                                        const meta = activityMeta(log.action);
                                        const Icon = meta.icon;

                                        return (
                                            <li key={log.id} className="flex gap-3">
                                                <span
                                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-5 text-gray-700">
                                                        <span className="font-medium text-gray-900">
                                                            {log.actor}
                                                        </span>{' '}
                                                        <span className="text-gray-500">
                                                            · {log.label}
                                                        </span>
                                                        {log.file && (
                                                            <>
                                                                {' '}
                                                                <span className="font-medium text-gray-800">
                                                                    {log.file}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-gray-400">
                                                        {log.actor_email && (
                                                            <span>{log.actor_email} · </span>
                                                        )}
                                                        {log.client && (
                                                            <span className="text-gray-500">
                                                                {log.client} ·{' '}
                                                            </span>
                                                        )}
                                                        {timeAgo(log.created_at)}
                                                    </p>
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
                            <EyeIcon className="h-7 w-7" />
                        </span>
                        <p className="mt-4 text-sm font-medium text-gray-900">
                            Aucune activité
                            {activeAction ? ' pour cette action' : ''}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Les consultations, téléchargements et partages apparaîtront ici.
                        </p>
                    </div>
                )}

                <div className="px-5 pb-4">
                    <Pagination paginator={logs} />
                </div>
            </section>
        </div>
    );
}
