import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    FolderIcon,
    DocumentIcon,
    PhotoIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    CloudArrowUpIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    HeartIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    XMarkIcon,
    CheckIcon,
    FolderPlusIcon,
} from '@/Components/Icons';

export default function FileIndex({ auth, project, files, folders, currentFolder, filters, stats }) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        folder_id: currentFolder?.id || '',
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const fileTypes = [
        { value: '', label: 'Tous' },
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Vidéos' },
        { value: 'document', label: 'Documents' },
    ];

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        if (file.is_image) return <PhotoIcon className="h-12 w-12 text-blue-400" />;
        if (file.is_video) return <VideoCameraIcon className="h-12 w-12 text-purple-400" />;
        if (file.is_document) return <DocumentTextIcon className="h-12 w-12 text-orange-400" />;
        return <DocumentIcon className="h-12 w-12 text-gray-400" />;
    };

    const getFileColor = (file) => {
        if (file.is_image) return 'bg-blue-50 hover:bg-blue-100';
        if (file.is_video) return 'bg-purple-50 hover:bg-purple-100';
        if (file.is_document) return 'bg-orange-50 hover:bg-orange-100';
        return 'bg-gray-50 hover:bg-gray-100';
    };

    // ✅ Version corrigée avec router.post
    const handleUpload = (e) => {
        e.preventDefault();
        
        if (!uploadFile) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('project_id', String(project.id)); // ✅ Convertir en string
        if (data.folder_id) {
            formData.append('folder_id', String(data.folder_id));
        }

        setUploading(true);

        router.post('/files/upload', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('✅ Upload réussi !');
                setShowUploadModal(false);
                setUploadFile(null);
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                window.location.reload();
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
                const errorMessage = typeof errors === 'string' ? errors : Object.values(errors).flat().join('\n');
                alert('Erreur: ' + errorMessage);
                setUploading(false);
            },
            onFinish: () => {
                setUploading(false);
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('files.index', project.id), {
            folder_id: currentFolder?.id || '',
            type: typeFilter,
            search: searchTerm,
        }, { preserveState: true });
    };

    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        router.get(route('files.index', project.id), {
            folder_id: currentFolder?.id || '',
            type: type,
            search: searchTerm,
        }, { preserveState: true });
    };

    const navigateFolder = (folderId) => {
        router.get(route('files.index', project.id), {
            folder_id: folderId || '',
            type: typeFilter,
            search: searchTerm,
        }, { preserveState: true });
    };

    const deleteFile = (file) => {
        if (confirm(`Voulez-vous vraiment supprimer "${file.original_name}" ?`)) {
            router.delete(route('files.destroy', file.id), {
                preserveScroll: true,
            });
        }
    };

    const toggleFavorite = (file) => {
        router.post(route('files.favorite', file.id), {}, {
            preserveScroll: true,
        });
    };

    const downloadFile = (file) => {
        window.open(route('files.download', file.id), '_blank');
    };

    const loadFilePreview = async (file) => {
        try {
            const response = await fetch(route('files.preview', file.id));
            const data = await response.json();
            setPreviewFile(data);
        } catch (error) {
            console.error('Error previewing file:', error);
        }
    };

    const createFolder = () => {
        if (!newFolderName.trim()) return;
        router.post(route('projects.create-folder', project.id), {
            name: newFolderName,
            parent_id: currentFolder?.id || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewFolder(false);
                setNewFolderName('');
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Fichiers - ${project.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('projects.show', project.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {project.title}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {stats.total_files} fichiers · {stats.human_size}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <button
                                onClick={() => setShowNewFolder(!showNewFolder)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                <FolderPlusIcon className="h-4 w-4 mr-2" />
                                Nouveau dossier
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                Uploader
                            </button>
                        </div>
                    </div>

                    {/* New Folder Input */}
                    {showNewFolder && (
                        <div className="mt-4 bg-white shadow-sm rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Nom du dossier"
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                />
                                <button
                                    onClick={createFolder}
                                    className="px-4 py-2 bg-tasho-primary text-white rounded-md text-sm hover:bg-tasho-primary/90"
                                >
                                    Créer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowNewFolder(false);
                                        setNewFolderName('');
                                    }}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Breadcrumb */}
                    <div className="mt-4 flex items-center space-x-2 text-sm">
                        <button
                            onClick={() => navigateFolder(null)}
                            className={`hover:text-tasho-primary transition ${!currentFolder ? 'text-tasho-primary font-medium' : 'text-gray-500'}`}
                        >
                            Racine
                        </button>
                        {currentFolder && (
                            <>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-700 font-medium">
                                    {currentFolder.name}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mt-4 bg-white shadow-sm rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Rechercher un fichier..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-tasho-primary focus:border-tasho-primary"
                                    />
                                </div>
                            </form>

                            <div className="flex items-center space-x-2">
                                {fileTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleTypeFilter(type.value)}
                                        className={`px-3 py-1.5 rounded-md text-sm transition ${
                                            typeFilter === type.value
                                                ? 'bg-tasho-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Folders */}
                    {folders.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Dossiers</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        onClick={() => navigateFolder(folder.id)}
                                        className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition text-center"
                                    >
                                        <FolderIcon className="h-12 w-12 mx-auto text-yellow-400" />
                                        <p className="mt-2 text-sm font-medium text-gray-700 truncate">
                                            {folder.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {folder.files_count} fichiers
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files Grid */}
                    {files.data && files.data.length > 0 ? (
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {files.data.map((file) => (
                                <div
                                    key={file.id}
                                    className={`group relative bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition ${getFileColor(file)}`}
                                >
                                    <div 
                                        className="aspect-square flex items-center justify-center cursor-pointer p-4"
                                        onClick={() => loadFilePreview(file)}
                                    >
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
                                            <span className="text-xs text-gray-400">
                                                {new Date(file.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex space-x-1">
                                        <button
                                            onClick={() => downloadFile(file)}
                                            className="p-1 bg-white rounded-md shadow-sm hover:bg-gray-50"
                                            title="Télécharger"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => toggleFavorite(file)}
                                            className="p-1 bg-white rounded-md shadow-sm hover:bg-gray-50"
                                            title="Favoris"
                                        >
                                            <HeartIcon className={`h-4 w-4 ${file.is_favorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                                        </button>
                                        <button
                                            onClick={() => deleteFile(file)}
                                            className="p-1 bg-white rounded-md shadow-sm hover:bg-gray-50"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 text-center">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-gray-100 p-6">
                                    <DocumentIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Aucun fichier
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || typeFilter 
                                    ? 'Aucun fichier ne correspond à vos filtres'
                                    : 'Commencez à uploader vos fichiers'}
                            </p>
                            {!searchTerm && !typeFilter && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                                    >
                                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                        Uploader des fichiers
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {files.links && files.links.length > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center space-x-1">
                                {files.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (link.url && !link.active) {
                                                router.get(link.url, {}, { preserveState: true });
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            link.active
                                                ? 'bg-tasho-primary text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!link.url}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowUploadModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Uploader un fichier
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fichier *
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            console.log('📎 Fichier sélectionné:', file?.name);
                                            setUploadFile(file);
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-tasho-primary/10 file:text-tasho-primary hover:file:bg-tasho-primary/20"
                                        required
                                    />
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Dossier
                                    </label>
                                    <select
                                        value={data.folder_id}
                                        onChange={(e) => setData('folder_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        <option value="">Racine</option>
                                        {folders.map((folder) => (
                                            <option key={folder.id} value={folder.id}>
                                                {folder.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setUploadFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || !uploadFile}
                                        className="px-4 py-2 text-sm font-medium text-white bg-tasho-primary rounded-md hover:bg-tasho-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Upload...' : 'Uploader'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/80" onClick={() => setPreviewFile(null)} />
                        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {previewFile.file.original_name}
                                </h3>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center min-h-[400px] bg-gray-100 rounded-lg">
                                {previewFile.type === 'video' ? (
                                    <video
                                        src={previewFile.url}
                                        controls
                                        className="max-h-[500px] rounded-lg"
                                    />
                                ) : previewFile.type === 'document' ? (
                                    <div className="text-center p-8">
                                        <DocumentIcon className="h-24 w-24 mx-auto text-gray-400" />
                                        <p className="mt-4 text-gray-500">
                                            Aperçu non disponible pour ce type de fichier
                                        </p>
                                        <a
                                            href={previewFile.download_url}
                                            className="mt-4 inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md hover:bg-tasho-primary/90"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                            Télécharger
                                        </a>
                                    </div>
                                ) : (
                                    <img
                                        src={previewFile.url}
                                        alt={previewFile.file.original_name}
                                        className="max-h-[500px] max-w-full rounded-lg object-contain"
                                    />
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Taille</p>
                                    <p className="font-medium">{formatSize(previewFile.file.size)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Type</p>
                                    <p className="font-medium">{previewFile.file.mime_type}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Téléchargements</p>
                                    <p className="font-medium">{previewFile.file.download_count}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Vues</p>
                                    <p className="font-medium">{previewFile.file.view_count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}