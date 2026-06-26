import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    PhotoIcon,
    VideoCameraIcon,
    DocumentIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    UserIcon,
    ClockIcon,
    FolderIcon,
    XMarkIcon,
} from '@/Components/Icons';

export default function GalleryShow({ access, project, files, folders, permissions }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        content: '',
        file_id: null,
    });

    useEffect(() => {
        // Charger les commentaires existants
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
                setComments([result.comment, ...comments]);
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
                const result = await response.json();
                if (favorites.includes(fileId)) {
                    setFavorites(favorites.filter(id => id !== fileId));
                    setIsFavorite(false);
                } else {
                    setFavorites([...favorites, fileId]);
                    setIsFavorite(true);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
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

    return (
        <>
            <Head title={project.title} />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {project.title}
                                </h1>
                                {project.description && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {project.description}
                                    </p>
                                )}
                                {project.client_name && (
                                    <p className="mt-1 text-sm text-gray-400">
                                        Client: {project.client_name}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    {access.view_count} vues
                                </span>
                                {access.expires_at && (
                                    <span className="flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        Expire le {new Date(access.expires_at).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {files && files.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer"
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <div className="aspect-square flex items-center justify-center p-4 bg-gray-50">
                                        {getFileIcon(file)}
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 truncate" title={file.original_name}>
                                            {file.original_name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-400">
                                                {formatSize(file.size)}
                                            </span>
                                            {permissions.can_favorite && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(file.id);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                                >
                                                    <HeartIcon className={`h-4 w-4 ${
                                                        favorites.includes(file.id) 
                                                            ? 'text-red-500 fill-current' 
                                                            : 'text-gray-400'
                                                    }`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <DocumentIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Aucun fichier
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Aucun fichier n'est disponible dans cette galerie.
                            </p>
                        </div>
                    )}
                </div>

                {/* File Preview Modal */}
                {selectedFile && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-black/80" onClick={() => setSelectedFile(null)} />
                            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedFile.original_name}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        {permissions.can_download && (
                                            <button
                                                onClick={() => downloadFile(selectedFile)}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {permissions.can_favorite && (
                                            <button
                                                onClick={() => toggleFavorite(selectedFile.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <HeartIcon className={`h-5 w-5 ${
                                                    favorites.includes(selectedFile.id) 
                                                        ? 'text-red-500 fill-current' 
                                                        : ''
                                                }`} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center min-h-[300px] bg-gray-100 rounded-lg">
                                    {selectedFile.is_video ? (
                                        <video
                                            src={`/gallery/${access.access_token}/view/${selectedFile.id}`}
                                            controls
                                            className="max-h-[500px] rounded-lg"
                                        />
                                    ) : selectedFile.is_image ? (
                                        <img
                                            src={`/gallery/${access.access_token}/view/${selectedFile.id}`}
                                            alt={selectedFile.original_name}
                                            className="max-h-[500px] max-w-full rounded-lg object-contain"
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            <DocumentIcon className="h-24 w-24 mx-auto text-gray-400" />
                                            <p className="mt-4 text-gray-500">
                                                Aperçu non disponible pour ce type de fichier
                                            </p>
                                            {permissions.can_download && (
                                                <button
                                                    onClick={() => downloadFile(selectedFile)}
                                                    className="mt-4 inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md hover:bg-tasho-primary/90"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                    Télécharger
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Taille</p>
                                        <p className="font-medium">{formatSize(selectedFile.size)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="font-medium">{selectedFile.mime_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Format</p>
                                        <p className="font-medium">{selectedFile.extension}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Ajouté le</p>
                                        <p className="font-medium">
                                            {new Date(selectedFile.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                {permissions.can_comment && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Commentaires
                            </h3>

                            <form onSubmit={submitComment} className="mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="mt-3 flex items-center space-x-2">
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
                                        className="px-4 py-2 bg-tasho-primary text-white rounded-md hover:bg-tasho-primary/90 disabled:opacity-50"
                                    >
                                        Envoyer
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="border-b border-gray-100 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-8 w-8 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                                        <UserIcon className="h-4 w-4 text-tasho-primary" />
                                                    </div>
                                                    <span className="font-medium text-sm text-gray-900">
                                                        {comment.visitor_name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Aucun commentaire. Soyez le premier à commenter !
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}