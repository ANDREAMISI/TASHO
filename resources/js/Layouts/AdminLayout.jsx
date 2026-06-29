import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Squares2X2Icon,
    HomeIcon,
    UsersIcon,
    CreditCardIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    UserGroupIcon,
    DocumentIcon,
    ArrowRightOnRectangleIcon, // ✅ Ajouter cette icône
} from '@/Components/Icons';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
    { name: 'Abonnements', href: '/admin/subscriptions', icon: CreditCardIcon },
    { name: 'Équipes', href: '/admin/teams', icon: UserGroupIcon },
    { name: 'Activité', href: '/admin/activity', icon: DocumentIcon },
    { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-tasho-dark text-white fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                            >
                                <Squares2X2Icon className="h-6 w-6" />
                            </button>
                            <Link href="/admin/dashboard" className="flex items-center ml-4">
                                <span className="text-2xl font-bold text-white">TASHO</span>
                                <span className="ml-2 text-xs bg-tasho-primary px-2 py-0.5 rounded-full text-white">
                                    Admin
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition relative">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                    <p className="text-xs text-white/70">Super Admin</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-tasho-primary text-white flex items-center justify-center text-sm font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                {/* ✅ AJOUTER LE BOUTON DE DÉCONNEXION */}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                                    title="Déconnexion"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out pt-16`}>
                <div className="h-full flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = url === item.href || url.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                                        ${isActive
                                            ? 'bg-tasho-primary/10 text-tasho-primary'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                        isActive ? 'text-tasho-primary' : 'text-gray-400 group-hover:text-gray-500'
                                    }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-tasho-primary/10 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Connecté en tant que</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                        {/* ✅ AJOUTER UN BOUTON DE DÉCONNEXION DANS LE SIDEBAR AUSSI */}
                        <div className="mt-3">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                Déconnexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`pt-16 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300 ease-in-out`}>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}