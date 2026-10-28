import { formatBytes } from '@/utils/format';

/**
 * Jauge de stockage utilisée dans la carte KPI.
 */
export default function StorageUsage({ used = 0, limit = 0, percentage = 0 }) {
    const percent = Math.min(Math.max(Number(percentage) || 0, 0), 100);

    const tone =
        percent >= 90
            ? 'bg-red-500'
            : percent >= 75
              ? 'bg-amber-500'
              : 'bg-tasho-primary';

    const displayPercent = percent > 0 && percent < 0.1 ? '< 0,1' : percent.toLocaleString('fr-FR');

    return (
        <div>
            <div className="text-xs text-gray-500">
                {displayPercent} % du quota utilisé
            </div>

            <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-valuenow={Math.round(percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Stockage utilisé : ${formatBytes(used)} sur ${formatBytes(limit)} (${displayPercent} %)`}
            >
                <div
                    className={`h-full rounded-full ${tone} transition-[width] duration-500`}
                    style={{ width: percent > 0 ? `${Math.max(percent, 1.5)}%` : '0%' }}
                />
            </div>
        </div>
    );
}
