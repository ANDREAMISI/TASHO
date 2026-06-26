import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Squares2X2Icon,
    HomeIcon,
    FolderIcon,
    DocumentIcon,
    UsersIcon,
    UserGroupIcon,
    LinkIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ChevronDown,
} from '@/Components/Icons';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projets', href: '/projects', icon: FolderIcon },
    { name: 'Fichiers', href: '/files', icon: DocumentIcon },
    { name: 'Équipe', href: '/team', icon: UsersIcon },
    { name: 'Clients', href: '/clients', icon: UserGroupIcon },
    { name: 'Partages', href: '/shares', icon: LinkIcon },
    { name: 'Activité', href: '/activity', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
];

export default function AuthenticatedLayout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                                aria-label="Toggle sidebar"
                            >
                                <Squares2X2Icon className="h-6 w-6" />
                            </button>
                            <Link href="/dashboard" className="flex items-center ml-4">
                                <span className="text-2xl font-bold text-tasho-primary">TASHO</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-1.5">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="bg-transparent border-none focus:outline-none text-sm text-gray-600 w-48 ml-2"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                                <div className="relative">
                                    <button className="flex items-center space-x-2 group">
                                        <div className="h-8 w-8 rounded-full bg-tasho-primary text-white flex items-center justify-center text-sm font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                    </button>
                                </div>
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

                    {/* Plan info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-tasho-primary/10 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Plan actuel</p>
                                    <p className="text-sm font-semibold text-tasho-primary">Studio</p>
                                </div>
                                <div className="bg-white/50 rounded-full px-2 py-1">
                                    <span className="text-xs font-medium text-tasho-primary">PRO</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Stockage utilisé</span>
                                    <span>34.2 GB / 100 GB</span>
                                </div>
                                <div className="mt-1 w-full bg-white/50 rounded-full h-1.5">
                                    <div className="bg-tasho-primary h-1.5 rounded-full" style={{ width: '34%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
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