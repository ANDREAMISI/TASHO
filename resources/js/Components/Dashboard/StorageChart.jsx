import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardCard from '@/Components/Dashboard/DashboardCard';
import { CloudIcon } from '@/Components/Icons';
import { formatBytes, plural } from '@/utils/format';

const COLORS = {
    images: '#6366F1',
    videos: '#0EA5E9',
    documents: '#10B981',
    audio: '#F59E0B',
    archives: '#8B5CF6',
    others: '#9CA3AF',
};

function StorageTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0].payload;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="mt-0.5 text-gray-500">
                {formatBytes(item.size)} · {plural(item.count, 'fichier', 'fichiers')}
            </p>
        </div>
    );
}

/**
 * Répartition du stockage par type de fichier (poids réel, pas le nombre).
 */
export default function StorageChart({ types = [], used = 0, limit = 0, className = '' }) {
    const filled = types.filter((type) => type.size > 0);

    return (
        <DashboardCard
            title="Stockage par type"
            description="Répartition du poids de vos fichiers"
            className={className}
        >
            {filled.length === 0 ? (
                <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
                    <CloudIcon className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-600">
                        Aucun fichier stocké
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Téléversez des fichiers dans un projet pour suivre votre
                        consommation.
                    </p>
                </div>
            ) : (
                <div className="flex h-full flex-col">
                    <div className="relative h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={filled}
                                    dataKey="size"
                                    nameKey="label"
                                    innerRadius="62%"
                                    outerRadius="92%"
                                    paddingAngle={2}
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {filled.map((type) => (
                                        <Cell
                                            key={type.key}
                                            fill={COLORS[type.key] || COLORS.others}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<StorageTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-semibold tracking-tight text-gray-900">
                                {formatBytes(used, 1)}
                            </span>
                            <span className="text-[11px] uppercase tracking-wide text-gray-400">
                                {limit > 0 ? `sur ${formatBytes(limit)}` : 'utilisés'}
                            </span>
                        </div>
                    </div>

                    <ul className="mt-2 space-y-2">
                        {filled.map((type) => (
                            <li key={type.key} className="flex items-center gap-2 text-xs">
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: COLORS[type.key] || COLORS.others }}
                                />
                                <span className="flex-1 truncate text-gray-600">
                                    {type.label}
                                </span>
                                <span className="tabular-nums text-gray-400">
                                    {type.count}
                                </span>
                                <span className="w-16 text-right font-medium tabular-nums text-gray-700">
                                    {formatBytes(type.size)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </DashboardCard>
    );
}
