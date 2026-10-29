import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Project/Pagination';
import ClientFormModal from '@/Components/Client/ClientFormModal';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    UserGroupIcon,
} from '@/Components/Icons';
import { formatDate, plural } from '@/utils/format';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}

export default function ClientIndex({ auth, clients, filters = {}, team }) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route('clients.index'),
            search.trim() ? { search: search.trim() } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('clients.index'), {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (client) => {
        setEditing(client);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
    };

    const confirmDelete = (client) => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer le client "${client.name}" ? Les partages associés seront supprimés.`,
            header: 'Supprimer le client',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('clients.destroy', client.id), {
                    preserveScroll: true,
                }),
        });
    };

    const data = clients?.data || [];
    const hasSearch = Boolean(filters.search);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clients - TASHO" />

            <ConfirmDialog />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Clients
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Gérez les clients de{' '}
                            <span className="font-medium text-gray-700">{team?.name}</span>.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Nouveau client
                    </button>
                </header>

                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                        <span className="relative block flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <InputText
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Rechercher un nom, un email, une entreprise…"
                                className="w-full !pl-9"
                            />
                        </span>

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                label="Rechercher"
                                icon="pi pi-search"
                                className="!bg-tasho-primary !border-tasho-primary"
                            />
                            {hasSearch && (
                                <Button
                                    type="button"
                                    label="Effacer"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    outlined
                                    onClick={clearSearch}
                                />
                            )}
                        </div>
                    </form>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">
                        {plural(clients?.total || 0, 'client', 'clients')}
                        {hasSearch ? ' correspondant à la recherche' : ''}
                    </p>
                </div>

                {data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {data.map((client) => (
                            <article
                                key={client.id}
                                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-tasho-primary/30 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tasho-primary/10 text-sm font-semibold text-tasho-primary">
                                            {initials(client.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-base font-semibold text-gray-900">
                                                {client.name}
                                            </h2>
                                            <p className="truncate text-xs text-gray-500">
                                                {client.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center">
                                        <Button
                                            type="button"
                                            icon="pi pi-pencil"
                                            rounded
                                            text
                                            severity="secondary"
                                            onClick={() => openEdit(client)}
                                            tooltip="Modifier"
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                        <Button
                                            type="button"
                                            icon="pi pi-trash"
                                            rounded
                                            text
                                            severity="danger"
                                            onClick={() => confirmDelete(client)}
                                            tooltip="Supprimer"
                                            tooltipOptions={{ position: 'left' }}
                                        />
                                    </div>
                                </div>

                                <dl className="mt-4 space-y-1.5 text-xs text-gray-500">
                                    {client.company && (
                                        <div className="flex items-center gap-1.5">
                                            <i className="pi pi-building text-gray-400" />
                                            <span>{client.company}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <i className="pi pi-phone text-gray-400" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                    {client.last_interaction_at && (
                                        <div className="flex items-center gap-1.5">
                                            <i className="pi pi-clock text-gray-400" />
                                            <span>
                                                Dernière interaction le{' '}
                                                {formatDate(client.last_interaction_at)}
                                            </span>
                                        </div>
                                    )}
                                </dl>

                                {client.notes && (
                                    <p className="mt-3 line-clamp-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                        {client.notes}
                                    </p>
                                )}

                                <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <i className="pi pi-folder text-gray-400" />
                                        <span className="tabular-nums">
                                            {client.projects_count || 0}
                                        </span>
                                        {client.projects_count > 1 ? 'projets' : 'projet'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <i className="pi pi-link text-gray-400" />
                                        <span className="tabular-nums">
                                            {client.accesses_count || 0}
                                        </span>
                                        {client.accesses_count > 1 ? 'partages' : 'partage'}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <UserGroupIcon className="h-7 w-7" />
                        </span>

                        <p className="mt-4 text-sm font-medium text-gray-900">
                            {hasSearch
                                ? 'Aucun client ne correspond à votre recherche'
                                : 'Aucun client pour le moment'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            {hasSearch
                                ? 'Essayez un autre nom, email ou entreprise.'
                                : 'Ajoutez votre premier client pour partager des livrables.'}
                        </p>

                        {hasSearch ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mt-4 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                Effacer la recherche
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Créer un client
                            </button>
                        )}
                    </div>
                )}

                <Pagination paginator={clients} />
            </div>

            <ClientFormModal visible={formOpen} onHide={closeForm} client={editing} />
        </AuthenticatedLayout>
    );
}
