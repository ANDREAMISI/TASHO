import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Avatar } from 'primereact/avatar';
import Button from '@/Components/Button';
import { Sidebar } from 'primereact/sidebar';
import AppTopbar from '@/Components/AppTopbar';
import SidebarNavGroup, { isLinkActive } from '@/Components/SidebarNavGroup';
import SidebarPlanCard from '@/Components/SidebarPlanCard';
import SidebarProjectNav from '@/Components/SidebarProjectNav';
import { ToastProvider } from '@/Components/Prime/ToastProvider';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    Cog6ToothIcon,
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
    const { url, props, component } = usePage();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const preferences = props.preferences || {};
    const sidebarOpenPreference = preferences.sidebar_open !== false;
    const [desktopOpen, setDesktopOpen] = useState(sidebarOpenPreference);
    const [mobileOpen, setMobileOpen] = useState(false);
    const appliedSidebarPreference = useRef(sidebarOpenPreference);

    const sidebarVisible = isDesktop ? desktopOpen : mobileOpen;
    const activeItem = navigation
        .flatMap((group) => group.items)
        .find((item) => isLinkActive(url, item));
    const projectContext = component === 'Project/Show' ? props?.project : null;
    const currentTab = props?.tab || 'overview';
    const initials =
        user?.initials || (user?.name || 'Utilisateur').charAt(0).toUpperCase();

    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    // La préférence « barre latérale ouverte » s'applique dès son enregistrement.
    useEffect(() => {
        if (appliedSidebarPreference.current === sidebarOpenPreference) {
            return;
        }

        appliedSidebarPreference.current = sidebarOpenPreference;
        setDesktopOpen(sidebarOpenPreference);
    }, [sidebarOpenPreference]);

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
        <ToastProvider>
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
                            {projectContext && (
                                <SidebarProjectNav
                                    project={projectContext}
                                    tab={currentTab}
                                    folderTree={props?.folderTree || []}
                                    currentFolderId={props?.currentFolderId ?? null}
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            )}

                            {navigation.map((group) => (
                                <SidebarNavGroup
                                    key={group.label}
                                    group={group}
                                    url={url}
                                    autoScroll={!projectContext}
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            ))}
                        </div>
                    </nav>

                    {/* Plan */}
                    {preferences.show_plan_card !== false && (
                        <SidebarPlanCard billing={props.billing} />
                    )}

                    {/* Utilisateur */}
                    <div className="shrink-0 border-t border-gray-200 p-3">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                            <Avatar
                                image={user?.avatar_url || undefined}
                                label={user?.avatar_url ? undefined : initials}
                                imageAlt={user?.name}
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
                    subtitle={
                        projectContext
                            ? `Projets · ${projectContext.title}`
                            : 'Espace client TASHO'
                    }
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    userMenuItems={userMenuItems}
                />

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
            </div>
        </ToastProvider>
    );
}
