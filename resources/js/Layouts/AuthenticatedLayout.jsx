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
    DocumentIcon,
    FolderIcon,
    HomeIcon,
    LinkIcon,
    UserGroupIcon,
    UsersIcon,
} from '@/Components/Icons';

const navigation = [
    {
        label: 'Principal',
        items: [{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon }],
    },
    {
        label: 'Contenu',
        items: [
            { name: 'Projets', href: '/projects', icon: FolderIcon },
            // Raccourci vers la liste des projets (pas d'index /files côté routes)
            { name: 'Fichiers', href: '/projects', icon: DocumentIcon, activeMatch: '/files' },
            { name: 'Équipe', href: '/team', icon: UsersIcon },
            { name: 'Clients', href: '/clients', icon: UserGroupIcon },
            { name: 'Partages', href: '/shares', icon: LinkIcon },
        ],
    },
    {
        label: 'Compte',
        items: [
            { name: 'Activité', href: '/activity', icon: ChartBarIcon },
            { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
        ],
    },
];

export default function AuthenticatedLayout({ children, user }) {
    const { url } = usePage();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [desktopOpen, setDesktopOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarVisible = isDesktop ? desktopOpen : mobileOpen;
    const activeItem = navigation
        .flatMap((group) => group.items)
        .find((item) => isLinkActive(url, item));
    const initials = (user?.name || 'Utilisateur').charAt(0).toUpperCase();

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
            label: 'Profil',
            icon: 'pi pi-user',
            command: () => router.visit('/profile'),
        },
        {
            label: 'Paramètres',
            icon: 'pi pi-cog',
            command: () => router.visit('/settings'),
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tasho-primary text-sm font-bold text-white">
                            T
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-bold leading-tight text-gray-900">TASHO</p>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-tasho-primary">
                                Espace client
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

                    {/* Plan */}
                    <div className="shrink-0 border-t border-gray-200 p-3">
                        <div className="rounded-lg bg-tasho-primary/10 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Plan actuel</p>
                                    <p className="text-sm font-semibold text-tasho-primary">Studio</p>
                                </div>
                                <div className="rounded-full bg-white/50 px-2 py-1">
                                    <span className="text-xs font-medium text-tasho-primary">PRO</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Stockage utilisé</span>
                                    <span>34.2 GB / 100 GB</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full rounded-full bg-white/50">
                                    <div
                                        className="h-1.5 rounded-full bg-tasho-primary"
                                        style={{ width: '34%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    {user?.name || 'Utilisateur'}
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
                    title={activeItem?.name || 'Espace client'}
                    subtitle="Espace client TASHO"
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    userMenuItems={userMenuItems}
                />

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
