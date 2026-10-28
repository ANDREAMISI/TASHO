import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from '@/Components/Icons';
import { formatNumber } from '@/utils/format';

/**
 * Pagination Inertia alignée sur le style des cartes du dashboard.
 * Réutilise les liens du paginator Laravel (donc les filtres sont conservés).
 */
export default function Pagination({ paginator, className = '' }) {
    if (!paginator || !Array.isArray(paginator.links) || paginator.links.length <= 3) {
        return null;
    }

    const go = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <div
            className={`flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row ${className}`}
        >
            <p className="text-xs text-gray-500">
                {formatNumber(paginator.from || 0)}–{formatNumber(paginator.to || 0)} sur{' '}
                {formatNumber(paginator.total || 0)}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {paginator.links.map((link, index) => {
                    const isFirst = index === 0;
                    const isLast = index === paginator.links.length - 1;
                    const isEllipsis = link.label === '...';
                    const disabled = !link.url;

                    return (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => go(link.url)}
                            disabled={disabled}
                            aria-label={
                                isFirst
                                    ? 'Page précédente'
                                    : isLast
                                      ? 'Page suivante'
                                      : `Page ${link.label}`
                            }
                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                                link.active
                                    ? 'bg-tasho-primary text-white shadow-sm'
                                    : disabled
                                      ? 'cursor-not-allowed text-gray-300'
                                      : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {isFirst ? (
                                <ChevronLeft className="h-4 w-4" />
                            ) : isLast ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : isEllipsis ? (
                                '…'
                            ) : (
                                link.label
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
