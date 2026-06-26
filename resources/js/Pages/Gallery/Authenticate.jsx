import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LockIcon, UserIcon, MailIcon, EyeIcon, EyeOffIcon } from '@/Components/Icons';

export default function GalleryAuthenticate({ access, token }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('public.authenticate', token));
    };

    return (
        <>
            <Head title="Accès à la galerie" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center">
                                <LockIcon className="h-8 w-8 text-tasho-primary" />
                            </div>
                        </div>
                        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
                            Accès à la galerie
                        </h2>
                        <p className="mt-1 text-center text-sm text-gray-500">
                            {access.project.title}
                        </p>
                        <p className="mt-1 text-center text-xs text-gray-400">
                            Cette galerie est privée. Veuillez vous identifier.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nom
                            </label>
                            <div className="mt-1 relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="pr-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Mot de passe de la galerie"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center px-4 py-2 bg-tasho-primary text-white rounded-md font-medium hover:bg-tasho-primary/90 transition disabled:opacity-50"
                        >
                            {processing ? 'Vérification...' : 'Accéder à la galerie'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400">
                        Cette galerie est sécurisée. Vos informations ne seront pas partagées.
                    </p>
                </div>
            </div>
        </>
    );
}