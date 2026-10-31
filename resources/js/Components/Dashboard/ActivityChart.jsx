import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import DashboardCard from '@/Components/Dashboard/DashboardCard';
import { ChartBarIcon } from '@/Components/Icons';
import { formatNumber, plural } from '@/utils/format';

const RANGES = [
    { days: 30, label: '30 jours' },
    { days: 90, label: '90 jours' },
];

function ActivityTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="mt-0.5 text-gray-500">
                {plural(payload[0].value, 'événement', 'événements')}
            </p>
        </div>
    );
}

/**
 * Courbe d'activité quotidienne (consultations, téléchargements, commentaires…).
 *
 * La série complète (90 jours) est fournie par le backend ; le sélecteur ne
 * fait que découper la fenêtre affichée, aucun aller-retour réseau.
 */
export default function ActivityChart({ series = [], className = '' }) {
    const [days, setDays] = useState(30);

    const data = useMemo(() => series.slice(-days), [series, days]);

    const total = useMemo(
        () => data.reduce((sum, day) => sum + day.count, 0),
        [data],
    );

    const peak = useMemo(
        () =>
            data.reduce(
                (best, day) => (day.count > (best?.count ?? 0) ? day : best),
                null,
            ),
        [data],
    );

    const rangeLabel = days === 30 ? '30 derniers jours' : '90 derniers jours';

    return (
        <DashboardCard
            title="Activité"
            description="Consultations, téléchargements et commentaires sur vos projets"
            className={className}
            action={
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    {RANGES.map((range) => (
                        <button
                            key={range.days}
                            type="button"
                            onClick={() => setDays(range.days)}
                            aria-pressed={days === range.days}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                days === range.days
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            }
        >
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
                        {formatNumber(total)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {total > 1 ? 'événements' : 'événement'} · {rangeLabel}
                    </p>
                </div>

                {peak && (
                    <p className="text-right text-xs text-gray-500">
                        Pic le <span className="font-medium text-gray-700">{peak.label}</span>
                        <br />
                        {plural(peak.count, 'événement', 'événements')}
                    </p>
                )}
            </div>

            {total === 0 ? (
                <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
                    <ChartBarIcon className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-600">
                        Aucune activité sur les {rangeLabel}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Les visites, téléchargements et commentaires de vos clients
                        apparaîtront ici.
                    </p>
                </div>
            ) : (
                <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                        >
                            <defs>
                                <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1B9CD8" stopOpacity={0.25} />
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
                                minTickGap={24}
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
                                fill="url(#activity-fill)"
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </DashboardCard>
    );
}
