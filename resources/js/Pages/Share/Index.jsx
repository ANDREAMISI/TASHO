import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LinkIcon,
    CopyIcon,
    CheckIcon,
    MessageSquare,
    ShieldCheckIcon,
    EyeIcon,
    DownloadIcon,
    HeartIcon,
    UserPlusIcon,
} from '@/Components/Icons';

export default function ShareIndex({ auth, projects, selectedProject, accesses, team }) {
    const [copiedId, setCopiedId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        client_name: '',
        client_email: '',
        is_public: true,
        can_download: true,
        can_comment: true,
        can_favorite: true,
        expires_in_days: 30,
        max_views: '',
        password: '',
    });

    const handleProjectChange = (projectId) => {
        if (!projectId) return;
        window.location.href = route('shares.index', { project_id: projectId });
    };

    const copyLink = async (shareUrl, accessId) => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedId(accessId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Impossible de copier le lien:', error);
        }
    };

    const shareOnWhatsApp = (shareUrl) => {
        const projectTitle = selectedProject?.title || 'Galerie TASHO';
        const message = `Bonjour, voici la galerie du projet ${projectTitle} : ${shareUrl}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const submitShare = (e) => {
        e.preventDefault();

        if (!selectedProject) {
            return;
        }

        post(route('shares.share', selectedProject.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Partages - TASHO" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Partages</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Gérez les liens de galerie et envoyez-les directement au client via WhatsApp.
                            </p>
                        </div>
                        <Link
                            href={route('shares.index')}
                            className="inline-flex items-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90"
                        >
                            Actualiser
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Projet</label>
                                <select
                                    value={selectedProject?.id || ''}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                >
                                    <option value="">Sélectionnez un projet</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedProject ? (
                                <form onSubmit={submitShare} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nom du client</label>
                                            <input
                                                type="text"
                                                value={data.client_name}
                                                onChange={(e) => setData('client_name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email du client</label>
                                            <input
                                                type="email"
                                                value={data.client_email}
                                                onChange={(e) => setData('client_email', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                                placeholder="Votre email"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Durée du lien (jours)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={data.expires_in_days}
                                                onChange={(e) => setData('expires_in_days', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre max de vues</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.max_views}
                                                onChange={(e) => setData('max_views', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                                placeholder="Optionnel"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mot de passe (optionnel)</label>
                                        <input
                                            type="text"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                            placeholder="Laissez vide pour un accès public"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={data.is_public}
                                                onChange={(e) => setData('is_public', e.target.checked)}
                                            />
                                            Accès public
                                        </label>
                                        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={data.can_download}
                                                onChange={(e) => setData('can_download', e.target.checked)}
                                            />
                                            Téléchargement
                                        </label>
                                        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={data.can_comment}
                                                onChange={(e) => setData('can_comment', e.target.checked)}
                                            />
                                            Commentaires
                                        </label>
                                        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={data.can_favorite}
                                                onChange={(e) => setData('can_favorite', e.target.checked)}
                                            />
                                            Favoris
                                        </label>
                                    </div>

                                    {errors && Object.keys(errors).length > 0 && (
                                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                            {Object.values(errors).flat().map((error, index) => (
                                                <p key={index}>{error}</p>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 disabled:opacity-60"
                                    >
                                        <UserPlusIcon className="h-4 w-4 mr-2" />
                                        {processing ? 'Création...' : 'Créer le lien de partage'}
                                    </button>
                                </form>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 text-center">
                                    Sélectionnez un projet pour créer un lien de partage client.
                                </div>
                            )}
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <ShieldCheckIcon className="h-5 w-5 text-tasho-primary" />
                                Liens actifs
                            </div>

                            <div className="mt-4 space-y-4">
                                {accesses.length > 0 ? (
                                    accesses.map((access) => (
                                        <div key={access.id} className="rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {access.client?.name || 'Invité'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 break-all">
                                                        {access.share_url}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {access.view_count} vues
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => copyLink(access.share_url, access.id)}
                                                    className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                                >
                                                    {copiedId === access.id ? (
                                                        <>
                                                            <CheckIcon className="h-3.5 w-3.5 mr-1 text-green-500" />
                                                            Copié
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CopyIcon className="h-3.5 w-3.5 mr-1" />
                                                            Copier
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => shareOnWhatsApp(access.share_url)}
                                                    className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                                    WhatsApp
                                                </button>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-500">
                                                {access.is_public && (
                                                    <span className="inline-flex items-center gap-1"><EyeIcon className="h-3 w-3" /> public</span>
                                                )}
                                                {access.can_download && (
                                                    <span className="inline-flex items-center gap-1"><DownloadIcon className="h-3 w-3" /> téléchargement</span>
                                                )}
                                                {access.can_comment && (
                                                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> commentaires</span>
                                                )}
                                                {access.can_favorite && (
                                                    <span className="inline-flex items-center gap-1"><HeartIcon className="h-3 w-3" /> favoris</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 text-center">
                                        Aucun partage actif pour ce projet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
