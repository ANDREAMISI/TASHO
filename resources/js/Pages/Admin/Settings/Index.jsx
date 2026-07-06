import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Cog6ToothIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    UserIcon,
    CheckIcon,
    XMarkIcon,
} from '@/Components/Icons';

export default function AdminSettings({ auth }) {
    const { data, setData, put, processing, errors } = useForm({
        site_name: 'TASHO',
        site_email: 'admin@tasho.com',
        maintenance_mode: false,
        registration_enabled: true,
        max_file_size: 500,
        allowed_file_types: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    const settingsSections = [
        {
            icon: GlobeAltIcon,
            title: 'Général',
            description: 'Configuration générale de la plateforme',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Sécurité',
            description: 'Paramètres de sécurité et d\'authentification',
        },
        {
            icon: EnvelopeIcon,
            title: 'Email',
            description: 'Configuration des emails et notifications',
        },
        {
            icon: UserIcon,
            title: 'Utilisateurs',
            description: 'Paramètres des comptes utilisateurs',
        },
    ];

    return (
        <AdminLayout user={auth.user}>
            <Head title="Paramètres - Administration" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Configuration de la plateforme
                            </p>
                        </div>
                    </div>

                    {/* Settings Cards */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {settingsSections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div key={index} className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 rounded-lg bg-tasho-primary/10 flex items-center justify-center">
                                            <Icon className="h-6 w-6 text-tasho-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{section.title}</h3>
                                            <p className="text-sm text-gray-500">{section.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Settings Form */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Configuration générale</h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom du site
                                </label>
                                <input
                                    type="text"
                                    value={data.site_name}
                                    onChange={(e) => setData('site_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email de contact
                                </label>
                                <input
                                    type="email"
                                    value={data.site_email}
                                    onChange={(e) => setData('site_email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Taille max des fichiers (MB)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.max_file_size}
                                        onChange={(e) => setData('max_file_size', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.maintenance_mode}
                                        onChange={(e) => setData('maintenance_mode', e.target.checked)}
                                        className="h-4 w-4 text-tasho-primary focus:ring-tasho-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Mode maintenance</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.registration_enabled}
                                        onChange={(e) => setData('registration_enabled', e.target.checked)}
                                        className="h-4 w-4 text-tasho-primary focus:ring-tasho-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Inscriptions autorisées</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Types de fichiers autorisés
                                </label>
                                <textarea
                                    value={data.allowed_file_types.join(', ')}
                                    onChange={(e) => setData('allowed_file_types', e.target.value.split(',').map(s => s.trim()))}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="image/jpeg, image/png, video/mp4"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Séparés par des virgules
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}