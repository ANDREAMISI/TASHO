import { useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Menubar } from 'primereact/menubar';

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
    const initials = (user?.name || 'Utilisateur').charAt(0).toUpperCase();

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
                aria-label="Notifications"
                className="relative !h-9 !w-9 !shrink-0 !p-0 !text-gray-600 hover:!bg-gray-100"
            >
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

            <button
                type="button"
                onClick={(event) => userMenu.current.toggle(event)}
                aria-label="Menu utilisateur"
                aria-haspopup
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100"
            >
                <Avatar
                    label={initials}
                    shape="circle"
                    className="!h-8 !w-8 !bg-tasho-primary !text-xs !font-semibold !text-white"
                />
                <div className="hidden text-left lg:block">
                    <p className="max-w-40 truncate text-sm font-medium text-gray-900">
                        {user?.name || 'Utilisateur'}
                    </p>
                    <p className="max-w-40 truncate text-xs text-gray-500">
                        {user?.email || ''}
                    </p>
                </div>
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
