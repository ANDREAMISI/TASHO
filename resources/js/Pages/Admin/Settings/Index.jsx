import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import SettingsFormModal from '@/Components/Admin/SettingsFormModal';
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
    const [formOpen, setFormOpen] = useState(false);

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
        <>
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

                    {/* Configuration générale */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-lg bg-tasho-primary/10 flex items-center justify-center">
                                    <Cog6ToothIcon className="h-6 w-6 text-tasho-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Configuration générale
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Nom du site, email de contact, maintenance et
                                        types de fichiers autorisés.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormOpen(true)}
                                className="inline-flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition"
                            >
                                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                                Modifier la configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SettingsFormModal
                visible={formOpen}
                onHide={() => setFormOpen(false)}
            />
        </>
    );
}

AdminSettings.layout = (page) => <AdminLayout>{page}</AdminLayout>;
