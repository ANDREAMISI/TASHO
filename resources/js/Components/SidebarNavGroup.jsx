import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDownIcon } from '@/Components/Icons';

/**
 * Vérifie si une entrée de navigation correspond à l'URL courante.
 * `item.activeMatch` permet de dissocier l'URL cible de l'URL surveillée
 * (ex. un raccourci « Fichiers » qui pointe vers /projects).
 */
export function isLinkActive(url, item) {
    const path = (url || '').split('?')[0].split('#')[0];
    const prefix = item.activeMatch || item.href;

    return path === prefix || path.startsWith(`${prefix}/`);
}

export default function SidebarNavGroup({ group, url, onNavigate }) {
    const containsActiveItem = group.items.some((item) => isLinkActive(url, item));
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (containsActiveItem) {
            setOpen(true);
        }
    }, [containsActiveItem]);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600"
            >
                <span>{group.label}</span>
                <ChevronDownIcon
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`grid transition-all duration-200 ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <ul className="min-h-0 space-y-0.5 overflow-hidden">
                    {group.items.map((item) => {
                        const active = isLinkActive(url, item);

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-tasho-primary/10 text-tasho-primary'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 shrink-0 ${
                                            active
                                                ? 'text-tasho-primary'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    <span className="truncate">{item.name}</span>
                                    {active && (
                                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-tasho-primary" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
