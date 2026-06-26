import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    FolderIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    DocumentTextIcon,
} from '@/Components/Icons';

export default function ProjectCreate({ auth, team, clients, statuses, priorities }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        client_id: '',
        client_name: '',
        client_email: '',
        status: 'draft',
        priority: 'medium',
        start_date: '',
        end_date: '',
    });

    const [useExistingClient, setUseExistingClient] = useState(false);

    const statusLabels = {
        draft: 'Brouillon',
        active: 'Actif',
        archived: 'Archivé',
        completed: 'Terminé',
    };

    const priorityLabels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute',
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nouveau projet - TASHO" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Nouveau projet</h1>
                            <p className="text-sm text-gray-500">
                                Créez un nouveau projet pour {team.name}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Titre du projet *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Ex: Mariage Sarah 2026"
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Décrivez votre projet..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Client */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Client
                                </label>
                                <div className="mt-1 space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={!useExistingClient}
                                                onChange={() => setUseExistingClient(false)}
                                                className="h-4 w-4 text-tasho-primary border-gray-300 focus:ring-tasho-primary"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Nouveau client</span>
                                        </label>
                                        {clients.length > 0 && (
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    checked={useExistingClient}
                                                    onChange={() => setUseExistingClient(true)}
                                                    className="h-4 w-4 text-tasho-primary border-gray-300 focus:ring-tasho-primary"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Client existant</span>
                                            </label>
                                        )}
                                    </div>

                                    {useExistingClient ? (
                                        <select
                                            value={data.client_id}
                                            onChange={(e) => setData('client_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        >
                                            <option value="">Sélectionner un client</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name} ({client.email})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={data.client_name}
                                                onChange={(e) => setData('client_name', e.target.value)}
                                                placeholder="Nom du client"
                                                className="rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                            />
                                            <input
                                                type="email"
                                                value={data.client_email}
                                                onChange={(e) => setData('client_email', e.target.value)}
                                                placeholder="Email du client"
                                                className="rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                            />
                                        </div>
                                    )}
                                </div>
                                {errors.client_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                                )}
                            </div>

                            {/* Status & Priority */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {statusLabels[status]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Priorité
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        {priorities.map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priorityLabels[priority]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date de début
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-tasho-primary rounded-md hover:bg-tasho-primary/90 transition disabled:opacity-50"
                                >
                                    {processing ? 'Création...' : 'Créer le projet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}