import { Link } from '@inertiajs/react';
import { Tag } from 'primereact/tag';
import DashboardCard from '@/Components/Dashboard/DashboardCard';
import { ArrowRightIcon, DocumentIcon, FolderOpenIcon } from '@/Components/Icons';
import { formatBytes, timeAgo } from '@/utils/format';

const STATUS = {
    draft: { label: 'Brouillon', severity: 'secondary' },
    active: { label: 'Actif', severity: 'success' },
    completed: { label: 'Terminé', severity: 'info' },
    archived: { label: 'Archivé', severity: 'warning' },
};

/**
 * Projets les plus récemment mis à jour.
 */
export default function RecentProjects({ projects = [], className = '' }) {
    return (
        <DashboardCard
            title="Projets récents"
            description="Les projets sur lesquels votre équipe a travaillé"
            className={className}
            action={
                <Link
                    href={route('projects.index')}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tasho-primary transition hover:bg-tasho-primary/5"
                >
                    Tous les projets
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
            }
        >
            {projects.length === 0 ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
                    <FolderOpenIcon className="h-8 w-8 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-600">
                        Aucun projet pour le moment
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Créez un projet pour organiser et partager vos fichiers.
                    </p>
                </div>
            ) : (
                <div className="-mx-5 -my-4">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="sr-only">
                            <tr>
                                <th scope="col">Projet</th>
                                <th scope="col">Statut</th>
                                <th scope="col">Fichiers</th>
                                <th scope="col">Mise à jour</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projects.map((project) => {
                                const status = STATUS[project.status] || {
                                    label: project.status,
                                    severity: 'secondary',
                                };

                                return (
                                    <tr
                                        key={project.id}
                                        className="group transition-colors hover:bg-gray-50/80"
                                    >
                                        <td className="px-5 py-3">
                                            <Link
                                                href={route('projects.show', project.id)}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tasho-primary/10 text-tasho-primary">
                                                    <FolderOpenIcon className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium text-gray-900 group-hover:text-tasho-primary">
                                                        {project.title}
                                                    </span>
                                                    <span className="block truncate text-xs text-gray-500">
                                                        {project.client_name || 'Sans client'}
                                                    </span>
                                                </span>
                                            </Link>
                                        </td>

                                        <td className="hidden px-5 py-3 sm:table-cell">
                                            <Tag
                                                value={status.label}
                                                severity={status.severity}
                                                rounded
                                                className="!px-2 !py-0.5 !text-[11px] !font-medium"
                                            />
                                        </td>

                                        <td className="hidden px-5 py-3 text-right md:table-cell">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                <DocumentIcon className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="tabular-nums">
                                                    {project.files_count}
                                                </span>
                                                <span className="text-gray-300">·</span>
                                                <span className="tabular-nums">
                                                    {formatBytes(project.files_size)}
                                                </span>
                                            </span>
                                        </td>

                                        <td className="px-5 py-3 text-right text-xs whitespace-nowrap text-gray-400">
                                            {timeAgo(project.updated_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardCard>
    );
}
