import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDownIcon, FolderIcon, FolderOpenIcon } from '@/Components/Icons';

/**
 * Retourne la liste des identifiants des dossiers parents d'un dossier cible.
 */
function findTrail(nodes, targetId, trail = []) {
    for (const node of nodes) {
        if (node.id === targetId) {
            return trail;
        }

        const found = findTrail(node.children || [], targetId, [...trail, node.id]);

        if (found) {
            return found;
        }
    }

    return null;
}

export default function SidebarFolderTree({
    projectId,
    tab = 'overview',
    tree = [],
    currentFolderId = null,
    onNavigate,
}) {
    const [open, setOpen] = useState(true);
    const [expanded, setExpanded] = useState(() => new Set());
    const activeRef = useRef(null);
    const onFilesTab = tab === 'files';

    // Ouvre automatiquement les dossiers parents du dossier courant.
    useEffect(() => {
        if (!currentFolderId) {
            return;
        }

        const trail = findTrail(tree, currentFolderId) || [];

        setExpanded((previous) => {
            const next = new Set(previous);
            trail.forEach((id) => next.add(id));
            // Déploie aussi le dossier courant pour révéler ses sous-dossiers.
            next.add(currentFolderId);

            return next.size === previous.size ? previous : next;
        });
    }, [currentFolderId, tree]);

    // Garde le dossier courant visible dans la sidebar.
    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [currentFolderId, expanded, tab]);

    const toggle = (id) => {
        setExpanded((previous) => {
            const next = new Set(previous);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const renderNodes = (nodes, depth = 0) =>
        nodes.map((node) => {
            const hasChildren = (node.children?.length ?? 0) > 0;
            const isOpen = expanded.has(node.id);
            const active = onFilesTab && node.id === currentFolderId;
            const Icon = isOpen || active ? FolderOpenIcon : FolderIcon;

            return (
                <li key={node.id}>
                    <div
                        className="flex items-center gap-0.5"
                        style={{ paddingLeft: `${depth * 12}px` }}
                    >
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => toggle(node.id)}
                                aria-label={
                                    isOpen ? `Réduire ${node.name}` : `Développer ${node.name}`
                                }
                                aria-expanded={isOpen}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 transition hover:bg-gray-200/70 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40"
                            >
                                <ChevronDownIcon
                                    className={`h-3 w-3 transition-transform duration-200 ${
                                        isOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        ) : (
                            <span className="h-5 w-5 shrink-0" />
                        )}

                        <Link
                            href={route('projects.show', {
                                project: projectId,
                                tab: 'files',
                                folder_id: node.id,
                            })}
                            onClick={onNavigate}
                            ref={active ? activeRef : undefined}
                            aria-current={active ? 'page' : undefined}
                            title={node.name}
                            className={`group flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40 ${
                                active
                                    ? 'bg-tasho-primary/10 font-medium text-tasho-primary'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <Icon
                                className={`h-4 w-4 shrink-0 ${
                                    active
                                        ? 'text-tasho-primary'
                                        : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            />
                            <span className="truncate">{node.name}</span>
                            {active && (
                                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-tasho-primary" />
                            )}
                        </Link>
                    </div>

                    {hasChildren && isOpen && (
                        <ul className="space-y-0.5">
                            {renderNodes(node.children, depth + 1)}
                        </ul>
                    )}
                </li>
            );
        });

    return (
        <div className="border-t border-gray-200 pt-2">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600"
            >
                <span className="inline-flex items-center gap-1.5">
                    <FolderIcon className="h-3.5 w-3.5" />
                    Dossiers
                </span>
                <ChevronDownIcon
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div className="mt-1">
                    <ul className="space-y-0.5">
                        <li>
                            <Link
                                href={route('projects.show', { project: projectId, tab: 'files' })}
                                onClick={onNavigate}
                                ref={onFilesTab && !currentFolderId ? activeRef : undefined}
                                aria-current={onFilesTab && !currentFolderId ? 'page' : undefined}
                                className={`flex items-center gap-2 rounded-md py-1 pl-6 pr-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tasho-primary/40 ${
                                    onFilesTab && !currentFolderId
                                        ? 'bg-tasho-primary/10 font-medium text-tasho-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <FolderOpenIcon
                                    className={`h-4 w-4 shrink-0 ${
                                        onFilesTab && !currentFolderId
                                            ? 'text-tasho-primary'
                                            : 'text-gray-400'
                                    }`}
                                />
                                <span className="truncate">Racine du projet</span>
                            </Link>
                        </li>

                        {renderNodes(tree)}
                    </ul>

                    {tree.length === 0 && (
                        <p className="px-2 py-1.5 text-xs text-gray-400">Aucun dossier</p>
                    )}
                </div>
            )}
        </div>
    );
}
