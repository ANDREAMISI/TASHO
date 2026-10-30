import { useEffect, useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Galleria } from 'primereact/galleria';
import { Dialog } from 'primereact/dialog';
import {
    ArrowDownTrayIcon,
    ChatBubbleLeftIcon,
    CheckIcon,
    CopyIcon,
    DocumentIcon,
    FolderIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    MessageSquare,
    PaperAirplaneIcon,
    PhotoIcon,
    PlayIcon,
    SparklesIcon,
    UserIcon,
    VideoCameraIcon,
    XMarkIcon,
} from '@/Components/Icons';
import { formatBytes, formatDate, timeAgo } from '@/utils/format';

const GALLERY_RESPONSIVE_OPTIONS = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 4 },
    { breakpoint: '560px', numVisible: 3 },
];

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

function GalleryToolbarButton({ label, onClick, disabled = false, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}

function CommentAvatar({ name }) {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();

    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tasho-primary/15 to-indigo-100 text-xs font-semibold text-tasho-primary ring-1 ring-tasho-primary/10">
            {initials || '?'}
        </span>
    );
}

export default function GalleryShow({ access, project, files, folders, permissions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState('all');
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [copyState, setCopyState] = useState(false);
    const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
    const [commentError, setCommentError] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const galleriaRef = useRef(null);

    const galleryFiles = useMemo(() => files || [], [files]);
    const galleryFolders = useMemo(() => folders || [], [folders]);

    const filteredFiles = useMemo(() => {
        return galleryFiles.filter((file) => {
            const matchesFolder =
                selectedFolderId === 'all' || file.folder_id === Number(selectedFolderId);
            const searchable = `${file.original_name} ${file.name}`.toLowerCase();
            const matchesSearch = searchable.includes(searchTerm.toLowerCase());
            return matchesFolder && matchesSearch;
        });
    }, [galleryFiles, selectedFolderId, searchTerm]);

    const folderCounts = useMemo(() => {
        const counts = {};
        galleryFiles.forEach((file) => {
            const folderId = file.folder_id ?? 'root';
            counts[folderId] = (counts[folderId] || 0) + 1;
        });
        return counts;
    }, [galleryFiles]);

    const currentFile = filteredFiles[activeIndex] ?? null;
    const hasActiveFilters = searchTerm !== '' || selectedFolderId !== 'all';

    // En mode plein écran, Galleria (PrimeReact 10) démarre masqué :
    // il faut appeler explicitement show() après le montage.
    useEffect(() => {
        if (galleryOpen) {
            galleriaRef.current?.show();
        }
    }, [galleryOpen]);

    useEffect(() => {
        const controller = new AbortController();
        setCommentsLoading(true);

        fetch(`/gallery/${access.access_token}/comments`, { signal: controller.signal })
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => setComments(Array.isArray(data) ? data : []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching comments:', error);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setCommentsLoading(false);
                }
            });

        return () => controller.abort();
    }, [access.access_token]);

    const fileUrl = (file, thumbnail = false) =>
        `/gallery/${access.access_token}/view/${file.id}${thumbnail ? '?thumb=1' : ''}`;

    const downloadUrl = (file) => `/gallery/${access.access_token}/download/${file.id}`;

    const openGallery = (index) => {
        setActiveIndex(index);
        setZoom(MIN_ZOOM);
        setRotation(0);
        setGalleryOpen(true);
    };

    const closeGallery = () => {
        setGalleryOpen(false);
        setZoom(MIN_ZOOM);
        setRotation(0);
    };

    const handleItemChange = (event) => {
        setActiveIndex(event.index ?? 0);
        setZoom(MIN_ZOOM);
        setRotation(0);
    };

    const resetTransform = () => {
        setZoom(MIN_ZOOM);
        setRotation(0);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedFolderId('all');
    };

    const submitComment = async (event) => {
        event.preventDefault();
        setCommentError('');

        if (!commentForm.content.trim()) {
            return;
        }

        setSubmittingComment(true);

        try {
            const response = await fetch(`/gallery/${access.access_token}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    ...commentForm,
                    file_id: null,
                }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setCommentError(
                    result.message ?? result.error ?? 'Impossible d’envoyer le commentaire.',
                );
                return;
            }

            setComments((previous) => [result.comment, ...previous]);
            setCommentForm((previous) => ({ ...previous, content: '' }));
        } catch (error) {
            console.error('Error submitting comment:', error);
            setCommentError('Impossible d’envoyer le commentaire.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const toggleFavorite = async (fileId) => {
        try {
            const response = await fetch(`/gallery/${access.access_token}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    file_id: fileId,
                    name: commentForm.name || 'Visiteur',
                    email: commentForm.email || 'visiteur@example.com',
                }),
            });

            if (response.ok) {
                const result = await response.json().catch(() => ({}));

                setFavorites((previous) => {
                    const shouldBeFavorite =
                        result.favorited ?? !previous.includes(fileId);

                    if (shouldBeFavorite) {
                        return previous.includes(fileId)
                            ? previous
                            : [...previous, fileId];
                    }

                    return previous.filter((id) => id !== fileId);
                });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const copyGalleryLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopyState(true);
            setTimeout(() => setCopyState(false), 2000);
        } catch (error) {
            console.error('Erreur de copie du lien:', error);
        }
    };

    const shareOnWhatsApp = () => {
        const message = `Bonjour, voici la galerie du projet ${project.title} : ${window.location.href}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const downloadFile = (file) => {
        if (!permissions.can_download) {
            return;
        }

        window.open(downloadUrl(file), '_blank');
    };

    const getFolderName = (id) => {
        if (id === null || id === undefined) {
            return 'Sans dossier';
        }

        const folder = galleryFolders.find((item) => item.id === Number(id));
        return folder ? folder.name : 'Autres fichiers';
    };

    const renderGridPreview = (file) => {
        if (file.is_image) {
            return (
                <img
                    src={fileUrl(file, true)}
                    alt={file.original_name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
            );
        }

        if (file.is_video) {
            return (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100 text-violet-500">
                    <VideoCameraIcon className="h-12 w-12" />
                </div>
            );
        }

        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 text-orange-400">
                <DocumentIcon className="h-12 w-12" />
            </div>
        );
    };

    const renderGalleryItem = (file) => {
        if (file.is_image) {
            return (
                <div className="flex h-full w-full items-center justify-center overflow-hidden p-2">
                    <img
                        src={fileUrl(file)}
                        alt={file.original_name}
                        draggable={false}
                        className="max-h-[72vh] max-w-full object-contain transition-transform duration-200"
                        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                    />
                </div>
            );
        }

        if (file.is_video) {
            return (
                <div className="flex h-full w-full items-center justify-center p-2">
                    <video
                        key={file.id}
                        src={fileUrl(file)}
                        controls
                        playsInline
                        className="max-h-[72vh] max-w-full rounded-lg bg-black"
                    />
                </div>
            );
        }

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
                <DocumentIcon className="h-20 w-20 text-white/50" />
                <div>
                    <p className="text-lg font-medium">{file.original_name}</p>
                    <p className="mt-1 text-sm text-white/60">
                        {file.mime_type} · {formatBytes(file.size)}
                    </p>
                </div>
                {permissions.can_download && (
                    <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        className="inline-flex items-center gap-2 rounded-lg bg-tasho-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-tasho-primary/90"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Télécharger
                    </button>
                )}
            </div>
        );
    };

    const renderGalleryThumbnail = (file) => {
        if (file.is_image) {
            return (
                <img
                    src={fileUrl(file, true)}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                />
            );
        }

        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white/60">
                {file.is_video ? (
                    <VideoCameraIcon className="h-5 w-5" />
                ) : (
                    <DocumentIcon className="h-5 w-5" />
                )}
            </div>
        );
    };

    const renderGalleryCaption = (file) => (
        <div className="flex flex-col text-white">
            <span className="truncate text-sm font-medium">{file.original_name}</span>
            <span className="text-xs text-white/60">
                {getFolderName(file.folder_id)} · {formatBytes(file.size)}
            </span>
        </div>
    );

    const galleryHeader = (
        <div className="flex w-full items-center justify-end gap-1 px-3 pb-2 pr-14 pt-3">
            {currentFile?.is_image && (
                <>
                    <GalleryToolbarButton
                        label="Zoom arrière"
                        onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - 0.25))}
                        disabled={zoom <= MIN_ZOOM}
                    >
                        <i className="pi pi-search-minus" />
                    </GalleryToolbarButton>
                    <GalleryToolbarButton label="Réinitialiser la vue" onClick={resetTransform}>
                        <i className="pi pi-replay" />
                    </GalleryToolbarButton>
                    <GalleryToolbarButton
                        label="Zoom avant"
                        onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + 0.25))}
                        disabled={zoom >= MAX_ZOOM}
                    >
                        <i className="pi pi-search-plus" />
                    </GalleryToolbarButton>
                    <GalleryToolbarButton
                        label="Pivoter"
                        onClick={() => setRotation((value) => value + 90)}
                    >
                        <i className="pi pi-refresh" />
                    </GalleryToolbarButton>
                    <span className="mx-1 h-5 w-px bg-white/20" />
                </>
            )}

            {permissions.can_favorite && currentFile && (
                <GalleryToolbarButton
                    label="Ajouter aux favoris"
                    onClick={() => toggleFavorite(currentFile.id)}
                >
                    <i
                        className={`pi ${
                            favorites.includes(currentFile.id)
                                ? 'pi-heart-fill text-red-400'
                                : 'pi-heart'
                        }`}
                    />
                </GalleryToolbarButton>
            )}

            {permissions.can_download && currentFile && (
                <GalleryToolbarButton
                    label="Télécharger"
                    onClick={() => downloadFile(currentFile)}
                >
                    <i className="pi pi-download" />
                </GalleryToolbarButton>
            )}
        </div>
    );

    const commentsDialogHeader = (
        <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tasho-primary/10 text-tasho-primary">
                <ChatBubbleLeftIcon className="h-5 w-5" />
            </span>
            <div>
                <p className="text-base font-semibold text-slate-900">Commentaires</p>
                <p className="text-xs text-slate-500">
                    {comments.length > 0
                        ? `${comments.length} message${comments.length > 1 ? 's' : ''} sur cette galerie`
                        : 'Soyez le premier à laisser un message'}
                </p>
            </div>
        </div>
    );

    return (
        <>
            <Head title={project.title} />

            <div className="min-h-screen bg-slate-50 pb-16">
                {/* En-tête */}
                <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                                <img
                                    src="/Images/logo.png"
                                    alt="TASHO"
                                    className="h-8 w-8 object-contain"
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tasho-primary">
                                    Galerie client
                                </p>
                                <h1 className="truncate text-base font-semibold text-slate-900">
                                    {project.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={copyGalleryLink}
                                title={copyState ? 'Lien copié' : 'Copier le lien'}
                                aria-label={copyState ? 'Lien copié' : 'Copier le lien'}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:px-3.5 sm:py-2"
                            >
                                {copyState ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 text-emerald-500" />
                                        <span className="hidden sm:inline">Lien copié</span>
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Copier le lien</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={shareOnWhatsApp}
                                title="Partager sur WhatsApp"
                                aria-label="Partager sur WhatsApp"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 sm:px-3.5 sm:py-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            {permissions.can_comment && (
                                <button
                                    type="button"
                                    onClick={() => setCommentsOpen(true)}
                                    title="Voir les commentaires"
                                    aria-label="Voir les commentaires"
                                    className="inline-flex items-center gap-2 rounded-xl bg-tasho-primary p-2.5 text-sm font-semibold text-white shadow-sm shadow-tasho-primary/30 transition hover:bg-tasho-primary/90 sm:px-3.5 sm:py-2"
                                >
                                    <ChatBubbleLeftIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Commentaires</span>
                                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold leading-4">
                                        {comments.length}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C5CE7] via-[#5C4FD6] to-[#2D3436] px-5 py-6 shadow-xl shadow-tasho-primary/10 sm:px-8 sm:py-8">
                        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-tasho-accent/20 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl text-white">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80 ring-1 ring-white/15">
                                    <SparklesIcon className="h-3.5 w-3.5" />
                                    Collection partagée
                                </div>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {project.title}
                                </h2>
                                {project.description && (
                                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                                        {project.description}
                                    </p>
                                )}
                                {project.client_name && (
                                    <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/75 ring-1 ring-white/10">
                                        <UserIcon className="h-3.5 w-3.5" />
                                        Client : {project.client_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
                                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15 backdrop-blur-sm">
                                    <p className="text-xl font-semibold text-white">
                                        {access.view_count}
                                    </p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/60">
                                        Vues
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15 backdrop-blur-sm">
                                    <p className="text-xl font-semibold text-white">
                                        {galleryFolders.length}
                                    </p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/60">
                                        Dossiers
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15 backdrop-blur-sm">
                                    <p className="text-xl font-semibold text-white">
                                        {galleryFiles.length}
                                    </p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/60">
                                        Fichiers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Filtres */}
                    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Rechercher un fichier..."
                                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-tasho-primary focus:outline-none focus:ring-2 focus:ring-tasho-primary/20"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Effacer la recherche"
                                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedFolderId('all')}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium ring-1 transition ${
                                    selectedFolderId === 'all'
                                        ? 'bg-tasho-primary text-white ring-tasho-primary shadow-sm shadow-tasho-primary/30'
                                        : 'bg-white text-slate-600 ring-slate-200 hover:text-slate-900 hover:ring-slate-300'
                                }`}
                            >
                                Tous
                                <span
                                    className={`rounded-full px-1.5 text-[10px] font-semibold ${
                                        selectedFolderId === 'all'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {galleryFiles.length}
                                </span>
                            </button>
                            {galleryFolders.map((folder) => {
                                const active = Number(selectedFolderId) === folder.id;

                                return (
                                    <button
                                        key={folder.id}
                                        type="button"
                                        onClick={() => setSelectedFolderId(String(folder.id))}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium ring-1 transition ${
                                            active
                                                ? 'bg-tasho-primary text-white ring-tasho-primary shadow-sm shadow-tasho-primary/30'
                                                : 'bg-white text-slate-600 ring-slate-200 hover:text-slate-900 hover:ring-slate-300'
                                        }`}
                                    >
                                        <FolderIcon className="h-3.5 w-3.5" />
                                        {folder.name}
                                        <span
                                            className={`rounded-full px-1.5 text-[10px] font-semibold ${
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {folderCounts[folder.id] || 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            {filteredFiles.length} fichier{filteredFiles.length > 1 ? 's' : ''}
                            {selectedFolderId !== 'all' && ` · ${getFolderName(Number(selectedFolderId))}`}
                        </span>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="font-medium text-tasho-primary transition hover:text-tasho-primary/80"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>

                    {/* Grille */}
                    {filteredFiles.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
                            {filteredFiles.map((file, index) => (
                                <article
                                    key={file.id}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-tasho-primary/30 hover:shadow-xl hover:shadow-slate-900/5 focus-within:ring-2 focus-within:ring-tasho-primary"
                                >
                                    <button
                                        type="button"
                                        onClick={() => openGallery(index)}
                                        aria-label={`Ouvrir ${file.original_name}`}
                                        className="block w-full text-left focus:outline-none"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                            {renderGridPreview(file)}

                                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/0 transition duration-300 group-hover:bg-slate-900/20">
                                                <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                                                    <MagnifyingGlassIcon className="h-4 w-4" />
                                                </span>
                                            </span>

                                            {file.is_video && (
                                                <span className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm">
                                                    <PlayIcon className="h-3.5 w-3.5" />
                                                </span>
                                            )}

                                            {file.is_document && (
                                                <span className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm">
                                                    <DocumentIcon className="h-3.5 w-3.5" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3">
                                            <p
                                                className="truncate text-sm font-medium text-slate-800"
                                                title={file.original_name}
                                            >
                                                {file.original_name}
                                            </p>
                                            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                                                <span className="flex min-w-0 items-center gap-1">
                                                    <FolderIcon className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">
                                                        {getFolderName(file.folder_id)}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 tabular-nums">
                                                    {formatBytes(file.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {permissions.can_favorite && (
                                        <button
                                            type="button"
                                            onClick={() => toggleFavorite(file.id)}
                                            title="Ajouter aux favoris"
                                            aria-label="Ajouter aux favoris"
                                            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-slate-500 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                                        >
                                            <HeartIcon
                                                className={`h-4 w-4 ${
                                                    favorites.includes(file.id)
                                                        ? 'fill-current text-red-500'
                                                        : ''
                                                }`}
                                            />
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <PhotoIcon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-slate-900">
                                Aucun fichier trouvé
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                                {hasActiveFilters
                                    ? 'Essayez un autre filtre ou un autre mot-clé.'
                                    : 'Aucun fichier n’est disponible dans cette galerie pour le moment.'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-5 inline-flex items-center rounded-xl bg-tasho-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-tasho-primary/90"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}

                    <footer className="mt-12 flex flex-col items-center gap-3 text-center text-xs text-slate-400">
                        <img
                            src="/Images/logo.png"
                            alt="TASHO"
                            className="h-12 w-12 object-contain opacity-90"
                        />
                        <p>
                            Galerie partagée via TASHO
                            {access.expires_at &&
                                ` · lien valable jusqu’au ${formatDate(access.expires_at)}`}
                        </p>
                    </footer>
                </main>
            </div>

            {/* Modale commentaires */}
            {permissions.can_comment && (
                <Dialog
                    visible={commentsOpen}
                    onHide={() => setCommentsOpen(false)}
                    modal
                    blockScroll
                    dismissableMask
                    draggable={false}
                    resizable={false}
                    className="w-[calc(100vw-2rem)] max-w-2xl overflow-hidden rounded-3xl"
                    contentClassName="pt-0"
                    header={commentsDialogHeader}
                >
                    <form onSubmit={submitComment} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                type="text"
                                placeholder="Votre nom"
                                value={commentForm.name}
                                onChange={(event) =>
                                    setCommentForm((previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-tasho-primary focus:ring-tasho-primary"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Votre email (facultatif)"
                                value={commentForm.email}
                                onChange={(event) =>
                                    setCommentForm((previous) => ({
                                        ...previous,
                                        email: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-tasho-primary focus:ring-tasho-primary"
                            />
                        </div>
                        <textarea
                            rows={3}
                            placeholder="Votre commentaire..."
                            value={commentForm.content}
                            onChange={(event) =>
                                setCommentForm((previous) => ({
                                    ...previous,
                                    content: event.target.value,
                                }))
                            }
                            className="mt-3 w-full resize-none rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-tasho-primary focus:ring-tasho-primary"
                            required
                        />
                        {commentError && (
                            <p className="mt-2 text-sm text-red-600">{commentError}</p>
                        )}
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={submittingComment}
                                className="inline-flex items-center gap-2 rounded-xl bg-tasho-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-tasho-primary/30 transition hover:bg-tasho-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                                {submittingComment ? 'Envoi…' : 'Publier'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Messages des visiteurs
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {comments.length}
                        </span>
                    </div>

                    <div className="mt-3 space-y-3">
                        {commentsLoading ? (
                            <p className="py-6 text-center text-sm text-slate-500">
                                Chargement des commentaires…
                            </p>
                        ) : comments.length > 0 ? (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-3.5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <CommentAvatar name={comment.visitor_name} />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {comment.visitor_name}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {timeAgo(comment.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center">
                                <ChatBubbleLeftIcon className="mx-auto h-8 w-8 text-slate-300" />
                                <p className="mt-2 text-sm font-medium text-slate-600">
                                    Aucun commentaire pour le moment
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Votre message apparaîtra ici après publication.
                                </p>
                            </div>
                        )}
                    </div>
                </Dialog>
            )}

            {galleryOpen && filteredFiles.length > 0 && (
                <Galleria
                    ref={galleriaRef}
                    value={filteredFiles}
                    activeIndex={activeIndex}
                    onItemChange={handleItemChange}
                    onHide={closeGallery}
                    fullScreen
                    closeOnEscape
                    circular={filteredFiles.length > 1}
                    showThumbnails
                    showItemNavigators
                    showThumbnailNavigators
                    numVisible={7}
                    responsiveOptions={GALLERY_RESPONSIVE_OPTIONS}
                    item={renderGalleryItem}
                    thumbnail={renderGalleryThumbnail}
                    caption={renderGalleryCaption}
                    header={galleryHeader}
                />
            )}
        </>
    );
}
