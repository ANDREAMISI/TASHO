import { formatBytes } from '@/utils/format';

const PLAN_BADGES = {
    free: 'Gratuit',
};

/**
 * Carte « Plan actuel » de la barre latérale, alimentée par les données
 * partagées depuis le backend (plan souscrit + stockage réel).
 */
export default function SidebarPlanCard({ billing }) {
    if (!billing) {
        return null;
    }

    const plan = billing.plan ?? null;
    const storage = billing.storage ?? { used: 0, limit: 0, percentage: 0 };

    const percent = Math.min(Math.max(Number(storage.percentage) || 0, 0), 100);
    const tone =
        percent >= 90
            ? 'bg-red-500'
            : percent >= 75
              ? 'bg-amber-500'
              : 'bg-tasho-primary';

    const badge = plan?.slug
        ? (PLAN_BADGES[plan.slug] ?? plan.slug).toUpperCase()
        : null;
    const storageLabel =
        storage.limit > 0
            ? `${formatBytes(storage.used)} / ${formatBytes(storage.limit)}`
            : `${formatBytes(storage.used)} utilisés`;

    return (
        <div className="shrink-0 border-t border-gray-200 p-3">
            <div className="rounded-lg bg-tasho-primary/10 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">Plan actuel</p>
                        <p className="truncate text-sm font-semibold text-tasho-primary">
                            {plan?.name || 'Aucun plan'}
                        </p>
                    </div>
                    {badge && (
                        <div className="shrink-0 rounded-full bg-white/50 px-2 py-1">
                            <span className="text-xs font-medium text-tasho-primary">
                                {badge}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    <div className="flex justify-between gap-2 text-xs text-gray-500">
                        <span>Stockage utilisé</span>
                        <span className="truncate text-right">{storageLabel}</span>
                    </div>
                    <div
                        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/50"
                        role="progressbar"
                        aria-valuenow={Math.round(percent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Stockage utilisé : ${storageLabel} (${percent.toLocaleString('fr-FR')} %)`}
                    >
                        <div
                            className={`h-full rounded-full ${tone} transition-[width] duration-500`}
                            style={{ width: percent > 0 ? `${Math.max(percent, 1.5)}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
