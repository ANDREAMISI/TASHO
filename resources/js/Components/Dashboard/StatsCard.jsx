import { Link } from '@inertiajs/react';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@/Components/Icons';

const ACCENTS = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
};

const ICON_COLORS = {
    indigo: 'text-indigo-500',
    sky: 'text-sky-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
};

/**
 * Badge de tendance : compare la période courante (30 j) à la précédente.
 */
function TrendBadge({ trend }) {
    if (!trend) {
        return null;
    }

    const { delta, percent } = trend;

    if (!delta) {
        return <span className="text-xs text-gray-400">Stable sur 30 j</span>;
    }

    const positive = delta > 0;
    const Icon = positive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
    const value =
        percent === null
            ? `${positive ? '+' : '-'}${Math.abs(delta)}`
            : `${positive ? '+' : ''}${percent} %`;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
        >
            <Icon className="h-3.5 w-3.5" />
            {value}
            <span className="font-normal text-gray-400">sur 30 j</span>
        </span>
    );
}

/**
 * Carte d'indicateur clé du dashboard.
 *
 * `children` permet d'ajouter un contenu sous le pied de carte (jauge de stockage).
 */
export default function StatsCard({
    label,
    value,
    icon: Icon,
    accent = 'indigo',
    hint,
    trend,
    href,
    children,
    variant = 'default',
}) {
    const card =
        variant === 'icon' ? (
            <div className="flex h-full flex-col items-center px-4 py-6 text-center">
                {Icon && (
                    <Icon
                        className={`h-24 w-24 transition duration-200 group-hover:scale-105 ${
                            ICON_COLORS[accent] || ICON_COLORS.indigo
                        }`}
                        strokeWidth={1.5}
                    />
                )}

                <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>

                <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
                    {value}
                </p>

                {hint && <p className="mt-1 text-xs leading-5 text-gray-500">{hint}</p>}

                <div className="mt-auto w-full pt-4">
                    {children}

                    {trend && (
                        <div
                            className={`flex flex-wrap items-center justify-center gap-2 ${
                                children ? 'mt-3' : ''
                            }`}
                        >
                            <TrendBadge trend={trend} />
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
                            {value}
                        </p>
                    </div>

                    {Icon && (
                        <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                                ACCENTS[accent] || ACCENTS.indigo
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                        </span>
                    )}
                </div>

                {hint && <p className="mt-1 text-xs leading-5 text-gray-500">{hint}</p>}

                <div className="mt-auto pt-4">
                    {children}

                    {trend && (
                        <div
                            className={`flex flex-wrap items-center justify-between gap-2 ${
                                children ? 'mt-3' : ''
                            }`}
                        >
                            <TrendBadge trend={trend} />
                        </div>
                    )}
                </div>
            </div>
        );

    if (!href) {
        return card;
    }

    return (
        <Link
            href={href}
            className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary focus-visible:ring-offset-2"
        >
            {card}
        </Link>
    );
}
