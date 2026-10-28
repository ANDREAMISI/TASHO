import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FilePreviewDialog from './FilePreviewDialog';
import Pagination from './Pagination';
import useFilePreview from './useFilePreview';
import { categoryMeta, FILE_CATEGORY_OPTIONS } from './projectMeta';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ChevronRight,
    CloudArrowUpIcon,
    EyeIcon,
    FolderIcon,
    FolderOpenIcon,
    FolderPlusIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
} from '@/Components/Icons';
import { formatBytes, plural, timeAgo } from '@/utils/format';

const SORT_OPTIONS = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'name', label: 'Nom (A–Z)' },
    { value: 'size', label: 'Taille (décroissante)' },
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'Toutes les catégories' },
    ...FILE_CATEGORY_OPTIONS,
];

const CHUNK_SIZE = 10 * 1024 * 1024;

export default function FilesTab({
    project,
    files,
    folders = [],
    currentFolder = null,
    breadcrumb = [],
    filters = {},
    folderOptions = [],
    canManage = false,
    canUpload = false,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [sort, setSort] = useState(filters.sort || 'recent');
    const [favorite, setFavorite] = useState(!!filters.favorite);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadFolderId, setUploadFolderId] = useState(currentFolder?.id ?? '');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const [folderOpen, setFolderOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folderTarget, setFolderTarget] = useState(null);
    const [folderBusy, setFolderBusy] = useState(false);

    const [renameFile, setRenameFile] = useState(null);
    const [renameName, setRenameName] = useState('');

    const { file: previewFile, loadingId, open: openPreview, close: closePreview } = useFilePreview();

    useEffect(() => {
        setSearch(filters.search || '');
        setCategory(filters.category || '');
        setSort(filters.sort || 'recent');
        setFavorite(!!filters.favorite);
    }, [filters.search, filters.category, filters.sort, filters.favorite]);

    const navigate = (overrides = {}) => {
        const params = {
            tab: 'files',
            folder_id:
                overrides.folder_id !== undefined
                    ? overrides.folder_id
                    : (currentFolder?.id ?? ''),
            category: overrides.category !== undefined ? overrides.category : category,
            search: overrides.search !== undefined ? overrides.search : search,
            sort: overrides.sort !== undefined ? overrides.sort : sort,
            favorite: (overrides.favorite !== undefined ? overrides.favorite : favorite) ? 1 : '',
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key];
            }
        });

        router.get(route('projects.show', project.id), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const submitSearch = (event) => {
        event.preventDefault();
        navigate({ search });
    };

    const selectCategory = (value) => {
        const next = value || '';
        setCategory(next);
        navigate({ category: next });
    };

    const selectSort = (value) => {
        const next = value || 'recent';
        setSort(next);
        navigate({ sort: next });
    };

    const toggleFavoriteFilter = () => {
        const next = !favorite;
        setFavorite(next);
        navigate({ favorite: next });
    };

    const openFolder = (folderId) => {
        setSearch('');
        setCategory('');
        navigate({ folder_id: folderId ?? '', search: '', category: '' });
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setFavorite(false);
        navigate({ search: '', category: '', favorite: false });
    };

    const hasFilters = Boolean(search || category || favorite);

    // ------------------------------------------------------------------
    // Upload (par blocs de 10 Mo)
    // ------------------------------------------------------------------

    const openUpload = () => {
        setUploadFolderId(currentFolder?.id ?? '');
        setUploadFiles([]);
        setUploadProgress(0);
        setUploadError(null);
        setUploadOpen(true);
    };

    const closeUpload = () => {
        if (uploading) {
            return;
        }

        setUploadOpen(false);
        setUploadFiles([]);
        setUploadProgress(0);
        setUploadError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelection = (event) => {
        const selected = Array.from(event.target.files || []);
        setUploadFiles(selected.map((file) => ({ file })));
        setUploadError(null);
    };

    const uploadOne = async (file, onProgress) => {
        const totalSize = file.size;
        const chunkCount = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));
        const uploadId = `${file.name.replace(/[^A-Za-z0-9_-]/g, '_')}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        for (let index = 0; index < chunkCount; index += 1) {
            const start = index * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, totalSize);
            const chunk = file.slice(start, end);

            const form = new FormData();
            form.append('chunk', chunk, file.name);
            form.append('project_id', String(project.id));
            if (uploadFolderId) {
                form.append('folder_id', String(uploadFolderId));
            }
            form.append('upload_id', uploadId);
            form.append('chunk_index', String(index));
            form.append('chunk_count', String(chunkCount));
            form.append('file_name', file.name);
            form.append('file_size', String(file.size));
            form.append('mime_type', file.type || 'application/octet-stream');

            await axios.post(route('files.upload.chunk'), form, {
                onUploadProgress: (event) => {
                    const loaded = start + (event.loaded || 0);
                    onProgress(Math.min(100, (loaded / totalSize) * 100));
                },
            });
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!uploadFiles.length) {
            setUploadError('Sélectionnez au moins un fichier.');
            return;
        }

        const emptyFile = uploadFiles.find((item) => item.file.size === 0);
        if (emptyFile) {
            setUploadError(`« ${emptyFile.file.name} » est vide et ne peut pas être envoyé.`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        const totalBytes = uploadFiles.reduce((sum, item) => sum + item.file.size, 0);
        let doneBytes = 0;

        try {
            for (const item of uploadFiles) {
                await uploadOne(item.file, (percent) => {
                    const currentBytes = (percent / 100) * item.file.size;
                    setUploadProgress(
                        Math.min(100, Math.round(((doneBytes + currentBytes) / totalBytes) * 100)),
                    );
                });

                doneBytes += item.file.size;
                setUploadProgress(Math.min(100, Math.round((doneBytes / totalBytes) * 100)));
            }

            const targetFolder = uploadFolderId;

            setUploading(false);
            setUploadOpen(false);
            setUploadFiles([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            router.reload({
                preserveScroll: true,
                onSuccess: () => {
                    if (String(targetFolder || '') !== String(currentFolder?.id || '')) {
                        navigate({ folder_id: targetFolder || '', search: '', category: '' });
                    }
                },
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.errors?.chunk?.[0] ||
                error.message ||
                'Erreur durant l’envoi.';
            setUploadError(message);
            setUploading(false);
        }
    };

    // ------------------------------------------------------------------
    // Dossiers
    // ------------------------------------------------------------------

    const openCreateFolder = () => {
        setFolderTarget(null);
        setFolderName('');
        setFolderOpen(true);
    };

    const openRenameFolder = (folder) => {
        setFolderTarget(folder);
        setFolderName(folder.name);
        setFolderOpen(true);
    };

    const submitFolder = (event) => {
        event.preventDefault();

        if (!folderName.trim()) {
            return;
        }

        setFolderBusy(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setFolderOpen(false);
                setFolderName('');
                setFolderTarget(null);
            },
            onFinish: () => setFolderBusy(false),
        };

        if (folderTarget) {
            router.put(
                route('projects.rename-folder', folderTarget.id),
                { name: folderName.trim() },
                options,
            );

            return;
        }

        router.post(
            route('projects.create-folder', project.id),
            {
                name: folderName.trim(),
                parent_id: currentFolder?.id ?? null,
            },
            options,
        );
    };

    const deleteFolder = (folder) => {
        confirmDialog({
            message: `Supprimer le dossier « ${folder.name} » ? Cette action est définitive.`,
            header: 'Supprimer le dossier',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('projects.delete-folder', folder.id), {
                    preserveScroll: true,
                }),
        });
    };

    // ------------------------------------------------------------------
    // Fichiers
    // ------------------------------------------------------------------

    const downloadFile = (file) => {
        window.open(route('files.download', file.id), '_blank');
    };

    const toggleFavorite = (file) => {
        router.post(route('files.favorite', file.id), {}, { preserveScroll: true });
    };

    const openRenameFile = (file) => {
        setRenameFile(file);
        setRenameName(file.original_name);
    };

    const submitRenameFile = (event) => {
        event.preventDefault();

        if (!renameFile || !renameName.trim()) {
            return;
        }

        router.put(
            route('files.update', renameFile.id),
            { name: renameName.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setRenameFile(null),
            },
        );
    };

    const deleteFile = (file) => {
        confirmDialog({
            message: `Supprimer « ${file.original_name} » ? Cette action est définitive.`,
            header: 'Supprimer le fichier',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () =>
                router.delete(route('files.destroy', file.id), { preserveScroll: true }),
        });
    };

    return (
        <div className="space-y-6">
            {/* Barre d'outils */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Rechercher un fichier dans ce projet…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-tasho-primary focus:outline-none focus:ring-2 focus:ring-tasho-primary/20"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        <Dropdown
                            value={category}
                            options={CATEGORY_OPTIONS}
                            onChange={(event) => selectCategory(event.value)}
                            className="w-full sm:w-52"
                        />

                        <Dropdown
                            value={sort}
                            options={SORT_OPTIONS}
                            onChange={(event) => selectSort(event.value)}
                            className="w-full sm:w-48"
                        />

                        <button
                            type="button"
                            onClick={toggleFavoriteFilter}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                favorite
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <HeartIcon
                                className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`}
                            />
                            Favoris
                        </button>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Fil d'Ariane + actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <button
                        type="button"
                        onClick={() => openFolder(null)}
                        className={`rounded-md px-1.5 py-0.5 font-medium transition ${
                            !currentFolder
                                ? 'text-tasho-primary'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Racine
                    </button>

                    {breadcrumb.map((item) => (
                        <span key={item.id} className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                            <button
                                type="button"
                                onClick={() => openFolder(item.id)}
                                className={`rounded-md px-1.5 py-0.5 font-medium transition ${
                                    currentFolder?.id === item.id
                                        ? 'text-gray-900'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {item.name}
                            </button>
                        </span>
                    ))}

                    {search && (
                        <span className="ml-1 rounded-full bg-tasho-primary/10 px-2 py-0.5 text-xs font-medium text-tasho-primary">
                            Recherche dans tout le projet
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {canManage && (
                        <button
                            type="button"
                            onClick={openCreateFolder}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            <FolderPlusIcon className="h-4 w-4" />
                            Nouveau dossier
                        </button>
                    )}

                    {canUpload && (
                        <button
                            type="button"
                            onClick={openUpload}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            Ajouter des fichiers
                        </button>
                    )}
                </div>
            </div>

            {/* Dossiers */}
            {!search && folders.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Dossiers</h2>
                        <span className="text-xs text-gray-500">
                            {plural(folders.length, 'dossier', 'dossiers')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-tasho-primary/30 hover:shadow-md"
                            >
                                <button
                                    type="button"
                                    onClick={() => openFolder(folder.id)}
                                    className="flex items-start gap-3 text-left"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                                        <FolderIcon className="h-5 w-5" />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-gray-900">
                                            {folder.name}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500">
                                            {plural(folder.files_count, 'fichier', 'fichiers')}
                                            {folder.children_count > 0 &&
                                                ` · ${plural(
                                                    folder.children_count,
                                                    'sous-dossier',
                                                    'sous-dossiers',
                                                )}`}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-400">
                                            {formatBytes(folder.files_size)}
                                        </span>
                                    </span>
                                </button>

                                {canManage && (
                                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => openRenameFolder(folder)}
                                            title="Renommer le dossier"
                                            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-500 shadow-sm ring-1 ring-gray-200 transition hover:text-gray-800"
                                        >
                                            <PencilIcon className="h-3.5 w-3.5" />
                                        </button>

                                        {folder.files_count === 0 && folder.children_count === 0 && (
                                            <button
                                                type="button"
                                                onClick={() => deleteFolder(folder)}
                                                title="Supprimer le dossier"
                                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-red-500 shadow-sm ring-1 ring-gray-200 transition hover:text-red-600"
                                            >
                                                <TrashIcon className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Fichiers */}
            <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">Fichiers</h2>
                    <span className="text-xs text-gray-500">
                        {plural(files.total, 'fichier', 'fichiers')}
                        {search
                            ? ' dans le projet'
                            : currentFolder
                              ? ` dans « ${currentFolder.name} »`
                              : ' à la racine'}
                    </span>
                </div>

                {files.data.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {files.data.map((file) => {
                            const meta = categoryMeta(file.category);
                            const Icon = meta.icon;

                            return (
                                <div
                                    key={file.id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-tasho-primary/30 hover:shadow-md"
                                >
                                    <button
                                        type="button"
                                        onClick={() => openPreview(file)}
                                        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${meta.tone}`}
                                    >
                                        {file.is_image ? (
                                            <img
                                                src={route('files.stream', file.id)}
                                                alt={file.original_name}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                                                <Icon className="h-7 w-7" />
                                            </span>
                                        )}

                                        {file.extension && !file.is_image && (
                                            <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                {file.extension}
                                            </span>
                                        )}

                                        {loadingId === file.id && (
                                            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                                                <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-500" />
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex flex-1 flex-col p-3">
                                        <p
                                            className="truncate text-sm font-medium text-gray-900"
                                            title={file.original_name}
                                        >
                                            {file.original_name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {formatBytes(file.size)} · {timeAgo(file.created_at)}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleFavorite(file)}
                                                title={
                                                    file.is_favorited
                                                        ? 'Retirer des favoris'
                                                        : 'Ajouter aux favoris'
                                                }
                                                className="rounded-md p-1 transition hover:bg-gray-100"
                                            >
                                                <HeartIcon
                                                    className={`h-4 w-4 ${
                                                        file.is_favorited
                                                            ? 'fill-current text-red-500'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                            </button>

                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openPreview(file)}
                                                    title="Aperçu"
                                                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => downloadFile(file)}
                                                    title="Télécharger"
                                                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                </button>

                                                {file.can_delete && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openRenameFile(file)}
                                                            title="Renommer"
                                                            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteFile(file)}
                                                            title="Supprimer"
                                                            className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FolderOpenIcon className="h-7 w-7" />
                        </span>

                        <p className="mt-4 text-sm font-medium text-gray-900">
                            {hasFilters
                                ? 'Aucun fichier ne correspond à vos filtres'
                                : currentFolder
                                  ? 'Ce dossier est vide'
                                  : 'Aucun fichier à la racine'}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            {hasFilters
                                ? 'Modifiez la recherche ou réinitialisez les filtres.'
                                : currentFolder
                                  ? 'Ajoutez des fichiers dans ce dossier ou ouvrez un autre dossier.'
                                  : 'Ouvrez un dossier ou ajoutez vos premiers fichiers.'}
                        </p>

                        {hasFilters ? (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-4 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                Effacer les filtres
                            </button>
                        ) : (
                            canUpload && (
                                <button
                                    type="button"
                                    onClick={openUpload}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
                                >
                                    <CloudArrowUpIcon className="h-4 w-4" />
                                    Ajouter des fichiers
                                </button>
                            )
                        )}
                    </div>
                )}

                <Pagination paginator={files} className="mt-5" />
            </section>

            {/* Modale d'upload */}
            <Dialog
                visible={uploadOpen}
                onHide={closeUpload}
                header="Ajouter des fichiers"
                style={{ width: '34rem' }}
                breakpoints={{ '640px': '92vw' }}
                modal
                draggable={false}
                resizable={false}
                closable={!uploading}
            >
                <form onSubmit={handleUpload} className="space-y-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-8 text-center transition hover:border-tasho-primary/40 hover:bg-tasho-primary/5">
                        <CloudArrowUpIcon className="h-8 w-8 text-tasho-primary" />
                        <span className="mt-2 text-sm font-medium text-gray-900">
                            Choisir des fichiers
                        </span>
                        <span className="mt-0.5 text-xs text-gray-500">
                            Envoi par blocs de 10 Mo, sans limite de taille.
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelection}
                            className="sr-only"
                        />
                    </label>

                    {uploadFiles.length > 0 && (
                        <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs">
                            {uploadFiles.map((item, index) => (
                                <li
                                    key={`${item.file.name}-${index}`}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="truncate text-gray-700">
                                        {item.file.name}
                                    </span>
                                    <span className="shrink-0 text-gray-400">
                                        {formatBytes(item.file.size)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Dossier de destination
                        </label>
                        <Dropdown
                            value={uploadFolderId}
                            options={[
                                { label: 'Racine du projet', value: '' },
                                ...folderOptions.map((folder) => ({
                                    label: folder.label,
                                    value: folder.id,
                                })),
                            ]}
                            onChange={(event) => setUploadFolderId(event.value)}
                            className="w-full"
                        />
                    </div>

                    {uploading && (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
                                <span>Envoi en cours…</span>
                                <span>{uploadProgress} %</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-2 rounded-full bg-tasho-primary transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={closeUpload}
                            disabled={uploading}
                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || uploadFiles.length === 0}
                            className="rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading ? `Envoi ${uploadProgress} %` : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </Dialog>

            {/* Modale dossier (création / renommage) */}
            <Dialog
                visible={folderOpen}
                onHide={() => setFolderOpen(false)}
                header={folderTarget ? 'Renommer le dossier' : 'Nouveau dossier'}
                style={{ width: '28rem' }}
                breakpoints={{ '640px': '92vw' }}
                modal
                draggable={false}
                resizable={false}
            >
                <form onSubmit={submitFolder} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nom du dossier
                        </label>
                        <input
                            type="text"
                            value={folderName}
                            onChange={(event) => setFolderName(event.target.value)}
                            placeholder="Ex. Photos du shooting"
                            autoFocus
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-tasho-primary focus:outline-none focus:ring-2 focus:ring-tasho-primary/20"
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        {folderTarget
                            ? 'Le dossier conserve son contenu et son emplacement.'
                            : `Le dossier sera créé dans ${
                                  currentFolder ? `« ${currentFolder.name} »` : 'la racine du projet'
                              }.`}
                    </p>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setFolderOpen(false)}
                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={folderBusy || !folderName.trim()}
                            className="rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {folderBusy ? 'Enregistrement…' : folderTarget ? 'Renommer' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Dialog>

            {/* Modale renommage fichier */}
            <Dialog
                visible={!!renameFile}
                onHide={() => setRenameFile(null)}
                header="Renommer le fichier"
                style={{ width: '28rem' }}
                breakpoints={{ '640px': '92vw' }}
                modal
                draggable={false}
                resizable={false}
            >
                <form onSubmit={submitRenameFile} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nom du fichier
                        </label>
                        <input
                            type="text"
                            value={renameName}
                            onChange={(event) => setRenameName(event.target.value)}
                            autoFocus
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-tasho-primary focus:outline-none focus:ring-2 focus:ring-tasho-primary/20"
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        Le fichier reste dans son dossier actuel.
                    </p>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setRenameFile(null)}
                            className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!renameName.trim()}
                            className="rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Dialog>

            <FilePreviewDialog file={previewFile} onHide={closePreview} />
            <ConfirmDialog />
        </div>
    );
}
