import { useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import Button from '@/Components/Button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Menubar } from 'primereact/menubar';
import { OverlayPanel } from 'primereact/overlaypanel';
import NotificationRow from '@/Components/Notifications/NotificationRow';
import { BellIcon } from '@/Components/Icons';
import { formatNumber } from '@/utils/format';

/**
 * Barre supérieure commune aux espaces admin et client.
 *
 * Basée sur `Menubar` (zones `start` / `end`) : le modèle est vide, la barre
 * ne sert que de conteneur — d'où `model={[]}` qui empêche PrimeReact
 * d'afficher son bouton de menu responsive.
 */
export default function AppTopbar({
    title,
    subtitle,
    user,
    onToggleSidebar,
    userMenuItems = [],
}) {
    const userMenu = useRef(null);
    const notificationsPanel = useRef(null);
    const { notificationsSummary } = usePage().props;
    const unreadCount = notificationsSummary?.unread_count ?? 0;
    const recentNotifications = notificationsSummary?.recent ?? [];
    const initials =
        user?.initials || (user?.name || 'Utilisateur').charAt(0).toUpperCase();

    const markAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const start = (
        <div className="flex min-w-0 items-center gap-3">
            <Button
                icon="pi pi-bars"
                text
                rounded
                onClick={onToggleSidebar}
                aria-label="Afficher ou masquer le menu"
                className="!h-9 !w-9 !shrink-0 !p-0 !text-gray-600 hover:!bg-gray-100"
            />
            <img
                src="/Images/logo.png"
                alt="TASHO"
                className="h-8 w-8 shrink-0 object-contain"
            />
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
                <p className="hidden truncate text-xs text-gray-500 sm:block">{subtitle}</p>
            </div>
        </div>
    );

    const end = (
        <div className="flex items-center gap-2 sm:gap-3">
            <IconField iconPosition="left" className="hidden md:block">
                <InputIcon className="pi pi-search !text-gray-400" />
                <InputText
                    placeholder="Rechercher..."
                    className="!h-9 !w-56 !rounded-lg !border-gray-200 !text-sm"
                />
            </IconField>

            <Button
                icon="pi pi-bell"
                text
                rounded
                aria-label={
                    unreadCount > 0
                        ? `Notifications (${unreadCount} non lues)`
                        : 'Notifications'
                }
                aria-haspopup
                onClick={(event) => notificationsPanel.current?.toggle(event)}
                className="relative !h-9 !w-9 !shrink-0 !overflow-visible !p-0 !text-gray-600 hover:!bg-gray-100"
            >
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            <OverlayPanel
                ref={notificationsPanel}
                className="!w-[22rem] !max-w-[calc(100vw-2rem)] !p-0"
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>

                    {unreadCount > 0 ? (
                        <span className="rounded-full bg-tasho-primary/10 px-2 py-0.5 text-[11px] font-semibold text-tasho-primary">
                            {formatNumber(unreadCount)} non lue{unreadCount > 1 ? 's' : ''}
                        </span>
                    ) : (
                        <span className="text-[11px] text-gray-400">À jour</span>
                    )}
                </div>

                {recentNotifications.length > 0 ? (
                    <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                        {recentNotifications.map((notification) => (
                            <li key={notification.id}>
                                <NotificationRow
                                    notification={notification}
                                    compact
                                    onNavigate={() => notificationsPanel.current?.hide()}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <BellIcon className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-sm font-medium text-gray-900">
                            Aucune notification
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Vous serez prévenu dès qu’il se passera quelque chose.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-xs font-medium text-tasho-primary transition hover:text-tasho-primary/80 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                        Tout marquer comme lu
                    </button>

                    <Link
                        href={route('notifications.index')}
                        onClick={() => notificationsPanel.current?.hide()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        Voir toutes
                        <i className="pi pi-arrow-right text-[10px]" />
                    </Link>
                </div>
            </OverlayPanel>

            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

            <button
                type="button"
                onClick={(event) => userMenu.current.toggle(event)}
                aria-label="Menu utilisateur"
                aria-haspopup
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100"
            >
                <Avatar
                    image={user?.avatar_url || undefined}
                    label={user?.avatar_url ? undefined : initials}
                    imageAlt={user?.name}
                    shape="circle"
                    className="!h-8 !w-8 !bg-tasho-primary !text-xs !font-semibold !text-white"
                />
                <i className="pi pi-chevron-down hidden text-[10px] text-gray-400 lg:block" />
            </button>

            <Menu model={userMenuItems} popup ref={userMenu} />
        </div>
    );

    return (
        <Menubar
            model={[]}
            start={start}
            end={end}
            className="app-topbar sticky top-0 z-20 !h-16 !rounded-none !border-x-0 !border-t-0 !border-b !border-gray-200 !bg-white/90 !px-4 !py-0 backdrop-blur sm:!px-6"
        />
    );
}
