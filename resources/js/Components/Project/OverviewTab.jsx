import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FilePreviewDialog from './FilePreviewDialog';
import useFilePreview from './useFilePreview';
import {
    activityMeta,
    categoryMeta,
    MEMBER_ROLES,
    priorityMeta,
    statusMeta,
} from './projectMeta';
import {
    ArrowRightIcon,
    BoltIcon,
    CalendarIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
    CloudIcon,
    EnvelopeIcon,
    EyeIcon,
    FolderIcon,
    PlusIcon,
    TagIcon,
    TrashIcon,
    UserIcon,
    UserPlusIcon,
} from '@/Components/Icons';
import { formatBytes, formatDate, plural, timeAgo } from '@/utils/format';

function SectionCard({ title, description, action, children, className = '' }) {
    return (
        <section
            className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
        >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                    )}
                </div>
                {action}
            </header>

            <div className="px-5 py-4">{children}</div>
        </section>
    );
}

function EmptyBlock({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center">
            <Icon className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">{title}</p>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
    );
}

function DetailRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-2.5 py-1.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className="mt-0.5 break-words text-sm text-gray-900">{children}</dd>
            </div>
        </div>
    );
}

export default function OverviewTab({
    project,
    stats,
    members = [],
    teamMembers = [],
    recentFiles = [],
    recentLogs = [],
    comments = [],
    canManageMembers = false,
    onOpenTab,
}) {
    const { file: previewFile, open: openPreview, close: closePreview } = useFilePreview();

    const [addOpen, setAddOpen] = useState(false);
    const [memberId, setMemberId] = useState(null);
    const [memberRole, setMemberRole] = useState('editor');
    const [memberBusy, setMemberBusy] = useState(false);

    const status = statusMeta(project.status);
    const priority = priorityMeta(project.priority);

    const usedCategories = (stats.categories || []).filter((item) => item.size > 0);
    const existingMemberIds = new Set([
        project.owner?.id,
        ...members.map((member) => member.id),
    ]);
    const availableMembers = teamMembers.filter(
        (member) => !existingMemberIds.has(member.id),
    );

    const submitMember = (event) => {
        event.preventDefault();

        if (!memberId) {
            return;
        }

        setMemberBusy(true);

        router.post(
            route('projects.add-member', project.id),
            { user_id: memberId, role: memberRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddOpen(false);
                    setMemberId(null);
                    setMemberRole('editor');
                },
                onFinish: () => setMemberBusy(false),
            },
        );
    };

    const removeMember = (member) => {
        confirmDialog({
            message: `Retirer ${member.name} du projet ?`,
            header: 'Retirer le membre',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Retirer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('projects.remove-member', [project.id, member.id]), {
                    preserveScroll: true,
                }),
        });
    };

    return (
        <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
                <SectionCard title="Description">
                    <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                        {project.description || 'Aucune description renseignée pour ce projet.'}
                    </p>
                </SectionCard>

                <SectionCard
                    title="Fichiers récents"
                    description={plural(stats.total_files, 'fichier au total', 'fichiers au total')}
                    action={
                        <button
                            type="button"
                            onClick={() => onOpenTab('files')}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tasho-primary transition hover:bg-tasho-primary/5"
                        >
                            Voir tous les fichiers
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                    }
                >
                    {recentFiles.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {recentFiles.map((file) => {
                                const meta = categoryMeta(file.category);
                                const Icon = meta.icon;

                                return (
                                    <li key={file.id}>
                                        <button
                                            type="button"
                                            onClick={() => openPreview(file)}
                                            className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-gray-50"
                                        >
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-gray-900">
                                                    {file.original_name}
                                                </span>
                                                <span className="block text-xs text-gray-500">
                                                    {formatBytes(file.size)} ·{' '}
                                                    {timeAgo(file.created_at)}
                                                </span>
                                            </span>

                                            <EyeIcon className="h-4 w-4 shrink-0 text-gray-300" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <EmptyBlock
                            icon={FolderIcon}
                            title="Aucun fichier pour le moment"
                            description="Ajoutez des fichiers depuis l'onglet Fichiers."
                        />
                    )}
                </SectionCard>

                <SectionCard
                    title="Activité récente"
                    description="Derniers événements enregistrés sur ce projet"
                    action={
                        <button
                            type="button"
                            onClick={() => onOpenTab('activity')}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tasho-primary transition hover:bg-tasho-primary/5"
                        >
                            Tout l'historique
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                    }
                >
                    {recentLogs.length > 0 ? (
                        <ul className="space-y-4">
                            {recentLogs.map((log) => {
                                const meta = activityMeta(log.action);
                                const Icon = meta.icon;

                                return (
                                    <li key={log.id} className="flex gap-3">
                                        <span
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm leading-5 text-gray-700">
                                                <span className="font-medium text-gray-900">
                                                    {log.actor}
                                                </span>{' '}
                                                <span className="text-gray-500">
                                                    · {log.label}
                                                </span>
                                                {log.file && (
                                                    <>
                                                        {' '}
                                                        <span className="font-medium text-gray-800">
                                                            {log.file}
                                                        </span>
                                                    </>
                                                )}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-gray-400">
                                                {log.client && (
                                                    <span className="text-gray-500">
                                                        {log.client} ·{' '}
                                                    </span>
                                                )}
                                                {timeAgo(log.created_at)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <EmptyBlock
                            icon={EyeIcon}
                            title="Aucune activité pour le moment"
                            description="Les consultations et téléchargements apparaîtront ici."
                        />
                    )}
                </SectionCard>

                <SectionCard
                    title="Commentaires"
                    description={plural(stats.comments_count, 'commentaire', 'commentaires')}
                >
                    {comments.length > 0 ? (
                        <ul className="space-y-4">
                            {comments.map((comment) => (
                                <li key={comment.id} className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">
                                        {(comment.author || '?').charAt(0).toUpperCase()}
                                    </span>

                                    <div className="min-w-0 flex-1 rounded-lg bg-gray-50 px-3 py-2">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <p className="text-sm font-medium text-gray-900">
                                                {comment.author}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {timeAgo(comment.created_at)}
                                            </p>
                                        </div>
                                        <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                                            {comment.content}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyBlock
                            icon={ChatBubbleLeftIcon}
                            title="Aucun commentaire"
                            description="Les retours de vos clients apparaîtront ici."
                        />
                    )}
                </SectionCard>
            </div>

            <div className="space-y-6">
                <SectionCard title="Informations">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow icon={UserIcon} label="Propriétaire">
                            {project.owner?.name || '—'}
                        </DetailRow>

                        <DetailRow icon={EnvelopeIcon} label="Client">
                            {project.client_name || 'Non renseigné'}
                            {project.client_email && (
                                <span className="mt-0.5 block text-xs text-gray-500">
                                    {project.client_email}
                                </span>
                            )}
                        </DetailRow>

                        <DetailRow icon={TagIcon} label="Statut">
                            <Tag value={status.label} severity={status.severity} rounded />
                        </DetailRow>

                        <DetailRow icon={BoltIcon} label="Priorité">
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}
                                />
                                {priority.label}
                            </span>
                        </DetailRow>

                        <DetailRow icon={CalendarIcon} label="Début">
                            {project.start_date ? formatDate(project.start_date) : 'Non défini'}
                        </DetailRow>

                        <DetailRow icon={CalendarIcon} label="Échéance">
                            {project.end_date ? formatDate(project.end_date) : 'Non définie'}
                        </DetailRow>

                        <DetailRow icon={ClockIcon} label="Créé le">
                            {formatDate(project.created_at)}
                        </DetailRow>

                        <DetailRow icon={ClockIcon} label="Mis à jour">
                            {timeAgo(project.updated_at)}
                        </DetailRow>
                    </dl>
                </SectionCard>

                <SectionCard
                    title="Stockage"
                    description={formatBytes(stats.total_size)}
                >
                    {usedCategories.length > 0 ? (
                        <ul className="space-y-3">
                            {usedCategories.map((item) => {
                                const meta = categoryMeta(item.key);

                                return (
                                    <li key={item.key}>
                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <span className="font-medium text-gray-700">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-500">
                                                {formatBytes(item.size)}
                                            </span>
                                        </div>

                                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-1.5 rounded-full ${meta.bar || 'bg-tasho-primary'}`}
                                                style={{
                                                    width: `${Math.max(item.percentage, 1)}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-1 text-[11px] text-gray-400">
                                            {plural(item.count, 'fichier', 'fichiers')}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <EmptyBlock
                            icon={CloudIcon}
                            title="Aucun fichier stocké"
                            description="La répartition par type apparaîtra ici."
                        />
                    )}

                    {stats.last_upload_at && (
                        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                            Dernier ajout {timeAgo(stats.last_upload_at)}
                        </p>
                    )}
                </SectionCard>

                <SectionCard
                    title="Équipe du projet"
                    description={plural(members.length, 'membre invité', 'membres invités')}
                    action={
                        canManageMembers && (
                            <button
                                type="button"
                                onClick={() => setAddOpen(true)}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tasho-primary transition hover:bg-tasho-primary/5"
                            >
                                <UserPlusIcon className="h-3.5 w-3.5" />
                                Ajouter
                            </button>
                        )
                    }
                >
                    <ul className="space-y-3">
                        {project.owner && (
                            <li className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tasho-primary/10 text-xs font-semibold text-tasho-primary">
                                    {project.owner.name.charAt(0).toUpperCase()}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {project.owner.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {project.owner.email}
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                    Propriétaire
                                </span>
                            </li>
                        )}

                        {members.map((member) => (
                            <li key={member.id} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                                    {member.name.charAt(0).toUpperCase()}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {member.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {member.email}
                                    </p>
                                </div>

                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                    {MEMBER_ROLES[member.role] || member.role}
                                </span>

                                {canManageMembers && (
                                    <button
                                        type="button"
                                        onClick={() => removeMember(member)}
                                        title="Retirer du projet"
                                        className="rounded-md p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {members.length === 0 && (
                        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                            Seul le propriétaire a accès à ce projet pour le moment.
                        </p>
                    )}
                </SectionCard>
            </div>

            <Dialog
                visible={addOpen}
                onHide={() => setAddOpen(false)}
                header="Ajouter un membre au projet"
                style={{ width: '30rem' }}
                breakpoints={{ '640px': '92vw' }}
                modal
                draggable={false}
                resizable={false}
            >
                <form onSubmit={submitMember} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Membre de l'équipe
                        </label>
                        <Dropdown
                            value={memberId}
                            options={availableMembers.map((member) => ({
                                label: `${member.name} (${member.email})`,
                                value: member.id,
                            }))}
                            onChange={(event) => setMemberId(event.value)}
                            placeholder="Sélectionner un membre"
                            className="w-full"
                            filter
                        />

                        {availableMembers.length === 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Tous les membres de l'équipe participent déjà à ce projet.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Rôle sur le projet
                        </label>
                        <Dropdown
                            value={memberRole}
                            options={Object.entries(MEMBER_ROLES).map(([value, label]) => ({
                                label,
                                value,
                            }))}
                            onChange={(event) => setMemberRole(event.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setAddOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={memberBusy || !memberId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <PlusIcon className="h-4 w-4" />
                            {memberBusy ? 'Ajout…' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </Dialog>

            <FilePreviewDialog file={previewFile} onHide={closePreview} />
            <ConfirmDialog />
        </div>
    );
}
