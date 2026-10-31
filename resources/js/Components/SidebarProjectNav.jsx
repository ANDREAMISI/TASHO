import { Link } from '@inertiajs/react';
import SidebarFolderTree from '@/Components/SidebarFolderTree';
import { ChartBarIcon, FolderIcon, LinkIcon, Squares2X2Icon } from '@/Components/Icons';

const PROJECT_TABS = [
    { key: 'overview', name: 'Aperçu', icon: Squares2X2Icon },
    { key: 'files', name: 'Fichiers', icon: FolderIcon },
    { key: 'activity', name: 'Activité', icon: ChartBarIcon },
    { key: 'shares', name: 'Partages', icon: LinkIcon },
];

/**
 * Sous-navigation contextuelle affichée dans la sidebar lorsqu'on est
 * à l'intérieur d'un projet : rappel du projet ouvert, accès aux sections
 * et arborescence des dossiers pour se déplacer dans l'arborescence.
 */
export default function SidebarProjectNav({
    project,
    tab = 'overview',
    folderTree = [],
    currentFolderId = null,
    onNavigate,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Projet en cours
            </p>

            <Link
                href={route('projects.show', project.id)}
                onClick={onNavigate}
                title={project.title}
                className="block truncate rounded-md px-2 pt-0.5 text-sm font-semibold text-gray-900 transition hover:text-tasho-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
            >
                {project.title}
            </Link>

            <ul className="mt-2 grid grid-cols-2 gap-1">
                {PROJECT_TABS.map((item) => {
                    const active = tab === item.key;
                    const href =
                        item.key === 'overview'
                            ? route('projects.show', project.id)
                            : route('projects.show', { project: project.id, tab: item.key });

                    return (
                        <li key={item.key}>
                            <Link
                                href={href}
                                onClick={onNavigate}
                                aria-current={active ? 'page' : undefined}
                                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40 ${
                                    active
                                        ? 'bg-white text-tasho-primary shadow-sm ring-1 ring-tasho-primary/15'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                            >
                                <item.icon
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                        active ? 'text-tasho-primary' : 'text-gray-400'
                                    }`}
                                />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-2">
                <SidebarFolderTree
                    projectId={project.id}
                    tab={tab}
                    tree={folderTree}
                    currentFolderId={currentFolderId}
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
}
