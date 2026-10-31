import { Link } from '@inertiajs/react';
import { CheckIcon, FolderIcon, TrashIcon } from '@/Components/Icons';
import { notificationMeta } from './notificationMeta';
import { timeAgo } from '@/utils/format';

/**
 * Ligne de notification partagée par la cloche et le centre de notifications.
 *
 * Le corps de la ligne ouvre la notification (marquage lu côté serveur puis
 * redirection) ; les actions restent en dehors du lien pour rester cliquables.
 */
export default function NotificationRow({
    notification,
    compact = false,
    onRead,
    onDelete,
    onNavigate,
}) {
    const meta = notificationMeta(notification.type);
    const Icon = meta.icon;
    const unread = !notification.is_read;

    const body = (
        <>
            <span
                className={`flex shrink-0 items-center justify-center rounded-lg ${
                    compact ? 'mt-0.5 h-8 w-8' : 'mt-0.5 h-9 w-9'
                } ${meta.tone}`}
            >
                <Icon className={compact ? 'h-4 w-4' : 'h-4 w-4'} />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                    <span
                        className={`text-sm leading-5 ${
                            unread
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-700'
                        }`}
                    >
                        {notification.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-gray-400">
                        {unread && !compact && (
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                                aria-label="Non lue"
                            />
                        )}
                        {timeAgo(notification.created_at)}
                    </span>
                </span>

                <span
                    className={`mt-0.5 block text-xs text-gray-500 ${
                        compact ? 'line-clamp-2' : ''
                    }`}
                >
                    {notification.message}
                </span>

                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {notification.subject?.label && (
                        <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
                            <FolderIcon className="h-3 w-3" />
                            <span className="truncate">{notification.subject.label}</span>
                        </span>
                    )}

                    <span className="text-[11px] text-gray-400">{meta.label}</span>
                </span>
            </span>
        </>
    );

    return (
        <div
            className={`group relative flex items-start gap-3 ${
                compact ? 'py-2.5' : 'px-4 py-3.5 sm:px-5'
            } ${unread ? 'bg-tasho-primary/[0.03]' : ''}`}
        >
            {notification.url ? (
                <Link
                    href={route('notifications.open', notification.id)}
                    onClick={onNavigate}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
                >
                    {body}
                </Link>
            ) : (
                <div className="flex min-w-0 flex-1 items-start gap-3">{body}</div>
            )}

            {!compact && (
                <div className="flex shrink-0 items-start gap-1">
                    {unread && onRead && (
                        <button
                            type="button"
                            onClick={() => onRead(notification)}
                            title="Marquer comme lue"
                            aria-label="Marquer comme lue"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <CheckIcon className="h-4 w-4" />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(notification)}
                            title="Supprimer"
                            aria-label="Supprimer la notification"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}

            {compact && unread && (
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
            )}
        </div>
    );
}
