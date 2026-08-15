import { useState, useEffect, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    PhotoIcon,
    VideoCameraIcon,
    DocumentIcon,
    HeartIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    UserIcon,
    ClockIcon,
    FolderIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    CopyIcon,
    CheckIcon,
    MessageSquare,
    FolderOpenIcon,
} from '@/Components/Icons';

export default function GalleryShow({ access, project, files, folders, permissions }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState('all');
    const [copyState, setCopyState] = useState(false);

    const { data, setData, processing } = useForm({
        name: '',
        email: '',
        content: '',
        file_id: null,
    });

    const galleryFiles = useMemo(() => files || [], [files]);
    const galleryFolders = useMemo(() => folders || [], [folders]);

    const filteredFiles = useMemo(() => {
        return galleryFiles.filter((file) => {
            const matchesFolder = selectedFolderId === 'all' || file.folder_id === Number(selectedFolderId);
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

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await fetch(`/gallery/${access.access_token}/comments`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();

        if (!data.content.trim()) return;

        try {
            const response = await fetch(`/gallery/${access.access_token}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    ...data,
                    file_id: selectedFile?.id || null,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setComments((prev) => [result.comment, ...prev]);
                setData('content', '');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const toggleFavorite = async (fileId) => {
        try {
            const response = await fetch(`/gallery/${access.access_token}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    file_id: fileId,
                    name: data.name || 'Visiteur',
                    email: data.email || 'visiteur@example.com',
                }),
            });

            if (response.ok) {
                if (favorites.includes(fileId)) {
                    setFavorites((prev) => prev.filter((id) => id !== fileId));
                } else {
                    setFavorites((prev) => [...prev, fileId]);
                }
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

    const downloadFile = async (file) => {
        if (!permissions.can_download) {
            alert('Le téléchargement est désactivé pour cette galerie.');
            return;
        }
        window.open(`/gallery/${access.access_token}/download/${file.id}`, '_blank');
    };

    const getFileIcon = (file) => {
        if (file.is_image) return <PhotoIcon className="h-16 w-16 text-blue-400" />;
        if (file.is_video) return <VideoCameraIcon className="h-16 w-16 text-purple-400" />;
        return <DocumentIcon className="h-16 w-16 text-orange-400" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFolderName = (id) => {
        const folder = galleryFolders.find((item) => item.id === Number(id));
        return folder ? folder.name : 'Autres fichiers';
    };

    return (
        <>
            <Head title={project.title} />

            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tasho-primary">Galerie client</p>
                                <h1 className="mt-2 text-2xl font-bold text-gray-900">{project.title}</h1>
                                {project.description && (
                                    <p className="mt-2 text-sm text-gray-500">{project.description}</p>
                                )}
                                {project.client_name && (
                                    <p className="mt-1 text-sm text-gray-400">Client : {project.client_name}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={copyGalleryLink}
                                    className="inline-flex items-center px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    {copyState ? (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                                            Lien copié
                                        </>
                                    ) : (
                                        <>
                                            <CopyIcon className="h-4 w-4 mr-2" />
                                            Copier le lien
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={shareOnWhatsApp}
                                    className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                                <div className="flex items-center text-gray-500 text-xs uppercase tracking-[0.15em]">
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Vues
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-gray-900">{access.view_count}</div>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                                <div className="flex items-center text-gray-500 text-xs uppercase tracking-[0.15em]">
                                    <FolderOpenIcon className="h-4 w-4 mr-2" />
                                    Dossiers
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-gray-900">{galleryFolders.length}</div>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                                <div className="flex items-center text-gray-500 text-xs uppercase tracking-[0.15em]">
                                    <DocumentIcon className="h-4 w-4 mr-2" />
                                    Fichiers
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-gray-900">{galleryFiles.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un fichier..."
                                className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:border-tasho-primary focus:ring-tasho-primary"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedFolderId('all')}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium border ${
                                    selectedFolderId === 'all'
                                        ? 'bg-tasho-primary text-white border-tasho-primary'
                                        : 'bg-white text-gray-700 border-gray-200'
                                }`}
                            >
                                Tous
                            </button>
                            {galleryFolders.map((folder) => (
                                <button
                                    key={folder.id}
                                    type="button"
                                    onClick={() => setSelectedFolderId(String(folder.id))}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium border ${
                                        Number(selectedFolderId) === folder.id
                                            ? 'bg-tasho-primary text-white border-tasho-primary'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    }`}
                                >
                                    {folder.name} ({folderCounts[folder.id] || 0})
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredFiles && filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <div className="relative aspect-square flex items-center justify-center bg-gray-50 p-4">
                                        {getFileIcon(file)}
                                        {permissions.can_favorite && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(file.id);
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 shadow-sm transition hover:bg-white"
                                            >
                                                <HeartIcon className={`h-4 w-4 ${favorites.includes(file.id) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-xs font-medium text-gray-700" title={file.original_name}>
                                                {file.original_name}
                                            </p>
                                            <span className="text-[10px] text-gray-400">{formatSize(file.size)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <FolderIcon className="h-3 w-3" />
                                            {getFolderName(file.folder_id)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <DocumentIcon className="h-10 w-10 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-5 text-lg font-medium text-gray-900">Aucun fichier trouvé</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {searchTerm || selectedFolderId !== 'all'
                                    ? 'Essayez un autre filtre ou un autre mot-clé.'
                                    : 'Aucun fichier n’est disponible dans cette galerie.'}
                            </p>
                        </div>
                    )}
                </div>

                {selectedFile && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4 py-8">
                            <div className="fixed inset-0 bg-black/80" onClick={() => setSelectedFile(null)} />
                            <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Aperçu</p>
                                        <h3 className="mt-1 text-lg font-semibold text-gray-900">{selectedFile.original_name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {permissions.can_download && (
                                            <button
                                                type="button"
                                                onClick={() => downloadFile(selectedFile)}
                                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            >
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {permissions.can_favorite && (
                                            <button
                                                type="button"
                                                onClick={() => toggleFavorite(selectedFile.id)}
                                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            >
                                                <HeartIcon className={`h-5 w-5 ${favorites.includes(selectedFile.id) ? 'text-red-500 fill-current' : ''}`} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-4 md:p-6">
                                    <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        {selectedFile.is_video ? (
                                            <video
                                                src={`/gallery/${access.access_token}/view/${selectedFile.id}`}
                                                controls
                                                className="max-h-[500px] w-full object-contain"
                                            />
                                        ) : selectedFile.is_image ? (
                                            <img
                                                src={`/gallery/${access.access_token}/view/${selectedFile.id}`}
                                                alt={selectedFile.original_name}
                                                className="max-h-[500px] w-full object-contain"
                                            />
                                        ) : (
                                            <div className="p-8 text-center">
                                                <DocumentIcon className="mx-auto h-20 w-20 text-gray-300" />
                                                <p className="mt-4 text-gray-500">Aperçu non disponible pour ce type de document.</p>
                                                {permissions.can_download && (
                                                    <button
                                                        type="button"
                                                        onClick={() => downloadFile(selectedFile)}
                                                        className="mt-4 inline-flex items-center rounded-md bg-tasho-primary px-4 py-2 text-sm font-medium text-white hover:bg-tasho-primary/90"
                                                    >
                                                        <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                                                        Télécharger
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 border-t border-gray-200 bg-white p-5 sm:grid-cols-2 md:grid-cols-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">Taille</p>
                                        <p className="mt-1 font-medium text-gray-700">{formatSize(selectedFile.size)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">Type</p>
                                        <p className="mt-1 font-medium text-gray-700">{selectedFile.mime_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">Dossier</p>
                                        <p className="mt-1 font-medium text-gray-700">{getFolderName(selectedFile.folder_id)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">Ajouté</p>
                                        <p className="mt-1 font-medium text-gray-700">
                                            {new Date(selectedFile.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {permissions.can_comment && (
                    <div className="max-w-7xl mx-auto px-4 pb-10 pt-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Commentaires</h3>
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{comments.length}</span>
                            </div>

                            <form onSubmit={submitComment} className="mb-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Votre nom"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Votre email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    />
                                </div>
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="text"
                                        placeholder="Votre commentaire..."
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-tasho-primary px-4 py-2 text-sm font-medium text-white hover:bg-tasho-primary/90 disabled:opacity-50"
                                    >
                                        Envoyer
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tasho-primary/10">
                                                        <UserIcon className="h-4 w-4 text-tasho-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{comment.visitor_name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">Aucun commentaire pour le moment.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
