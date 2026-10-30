import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import AppTopbar from '@/Components/AppTopbar';
import SidebarNavGroup, { isLinkActive } from '@/Components/SidebarNavGroup';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    DocumentIcon,
    UserGroupIcon,
    UsersIcon,
} from '@/Components/Icons';

const navigation = [
    {
        label: 'Général',
        items: [
            { name: 'Tableau de bord', href: '/admin/dashboard', icon: ChartBarIcon },
        ],
    },
    {
        label: 'Gestion',
        items: [
            { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
            { name: 'Plans', href: '/admin/plans', icon: CurrencyDollarIcon },
            { name: 'Abonnements', href: '/admin/subscriptions', icon: CreditCardIcon },
            { name: 'Équipes', href: '/admin/teams', icon: UserGroupIcon },
        ],
    },
    {
        label: 'Système',
        items: [
            { name: 'Activité', href: '/admin/activity', icon: DocumentIcon },
            { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
        ],
    },
];

export default function AdminLayout({ children, user }) {
    const { url } = usePage();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [desktopOpen, setDesktopOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarVisible = isDesktop ? desktopOpen : mobileOpen;
    const activeItem = navigation
        .flatMap((group) => group.items)
        .find((item) => isLinkActive(url, item));
    const initials = (user?.name || 'Administrateur').charAt(0).toUpperCase();

    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    const toggleSidebar = () => {
        if (isDesktop) {
            setDesktopOpen((value) => !value);
        } else {
            setMobileOpen((value) => !value);
        }
    };

    const closeSidebar = () => {
        setDesktopOpen(false);
        setMobileOpen(false);
    };

    const userMenuItems = [
        {
            label: 'Paramètres',
            icon: 'pi pi-cog',
            command: () => router.visit('/admin/settings'),
        },
        { separator: true },
        {
            label: 'Déconnexion',
            icon: 'pi pi-sign-out',
            command: () => router.post('/logout'),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                key={isDesktop ? 'desktop' : 'mobile'}
                visible={sidebarVisible}
                position="left"
                onHide={closeSidebar}
                showCloseIcon={false}
                closeOnEscape={!isDesktop}
                blockScroll={!isDesktop}
                maskClassName={isDesktop ? '!pointer-events-none !bg-transparent' : ''}
                className="app-sidebar"
                style={{ width: '18rem' }}
            >
                <div className="flex h-full flex-col bg-white">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
                        <img
                            src="/Images/logo.png"
                            alt="TASHO"
                            className="h-10 w-10 shrink-0 object-contain"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-bold leading-tight text-gray-900">TASHO</p>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-tasho-primary">
                                Administration
                            </p>
                        </div>
                        <Button
                            icon="pi pi-times"
                            text
                            rounded
                            onClick={closeSidebar}
                            aria-label="Fermer le menu"
                            className="!h-8 !w-8 !p-0 !text-gray-500 lg:!hidden"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        <div className="space-y-6">
                            {navigation.map((group) => (
                                <SidebarNavGroup
                                    key={group.label}
                                    group={group}
                                    url={url}
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            ))}
                        </div>
                    </nav>

                    {/* Utilisateur */}
                    <div className="shrink-0 border-t border-gray-200 p-3">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                            <Avatar
                                label={initials}
                                shape="circle"
                                className="!h-9 !w-9 !bg-tasho-primary !text-sm !font-semibold !text-white"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    {user?.name || 'Administrateur'}
                                </p>
                                <p className="truncate text-xs text-gray-500">{user?.email || ''}</p>
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                aria-label="Déconnexion"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </Sidebar>

            <div
                className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
                    isDesktop && desktopOpen ? 'lg:pl-72' : ''
                }`}
            >
                {/* Barre supérieure */}
                <AppTopbar
                    title={activeItem?.name || 'Administration'}
                    subtitle="Panneau d'administration TASHO"
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    userMenuItems={userMenuItems}
                />

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
