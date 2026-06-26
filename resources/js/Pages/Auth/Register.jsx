import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register({ professions, workTypes, storageVolumes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        country: '',
        profession: '',
        work_type: 'alone',
        storage_volume: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Inscription - TASHO" />

            <form onSubmit={submit} className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Créer votre compte</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Rejoignez la communauté des professionnels des médias
                    </p>
                </div>

                <div className="space-y-4">
                    {/* ============================================ */}
                    {/* Informations personnelles */}
                    {/* ============================================ */}
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                            Informations personnelles
                        </h3>
                        
                        {/* Nom complet */}
                        <div>
                            <InputLabel htmlFor="name" value="Nom complet *" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Email */}
                        <div className="mt-4">
                            <InputLabel htmlFor="email" value="Email *" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Téléphone */}
                        <div className="mt-4">
                            <InputLabel htmlFor="phone" value="Téléphone" />
                            <TextInput
                                id="phone"
                                type="tel"
                                name="phone"
                                value={data.phone}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        {/* Pays */}
                        <div className="mt-4">
                            <InputLabel htmlFor="country" value="Pays" />
                            <TextInput
                                id="country"
                                type="text"
                                name="country"
                                value={data.country}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('country', e.target.value)}
                            />
                            <InputError message={errors.country} className="mt-2" />
                        </div>

                        {/* Mot de passe */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Mot de passe *" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Confirmation mot de passe */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe *" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* Informations professionnelles */}
                    {/* ============================================ */}
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                            Informations professionnelles
                        </h3>
                        
                        {/* Métier */}
                        <div>
                            <InputLabel htmlFor="profession" value="Métier *" />
                            <SelectInput
                                id="profession"
                                name="profession"
                                value={data.profession}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('profession', e.target.value)}
                                required
                            >
                                <option value="">Sélectionnez votre métier</option>
                                {professions.map((profession) => (
                                    <option key={profession} value={profession}>
                                        {profession}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.profession} className="mt-2" />
                        </div>

                        {/* Type de travail */}
                        <div className="mt-4">
                            <InputLabel htmlFor="work_type" value="Travaillez-vous ? *" />
                            <div className="mt-2 space-y-2">
                                {Object.entries(workTypes).map(([value, label]) => (
                                    <label key={value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="work_type"
                                            value={value}
                                            checked={data.work_type === value}
                                            onChange={(e) => setData('work_type', e.target.value)}
                                            className="h-4 w-4 text-tasho-primary border-gray-300 focus:ring-tasho-primary"
                                            required
                                        />
                                        <span className="ml-2 text-sm text-gray-600">{label}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.work_type} className="mt-2" />
                        </div>

                        {/* Volume de stockage */}
                        <div className="mt-4">
                            <InputLabel htmlFor="storage_volume" value="Volume de stockage utilisé *" />
                            <SelectInput
                                id="storage_volume"
                                name="storage_volume"
                                value={data.storage_volume}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('storage_volume', e.target.value)}
                                required
                            >
                                <option value="">Sélectionnez le volume</option>
                                {storageVolumes.map((volume) => (
                                    <option key={volume} value={volume}>
                                        {volume}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.storage_volume} className="mt-2" />
                        </div>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex items-center justify-between mt-4">
                    <Link
                        href={route('login')}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition"
                    >
                        Déjà inscrit ?
                    </Link>

                    <button
                        type="submit"
                        className="inline-flex items-center px-6 py-2.5 bg-tasho-primary border border-transparent rounded-lg font-medium text-sm text-white uppercase tracking-wider hover:bg-tasho-primary/90 focus:outline-none focus:ring-2 focus:ring-tasho-primary focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Inscription...
                            </>
                        ) : (
                            'S\'inscrire'
                        )}
                    </button>
                </div>

                {/* Message de sécurité */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        En créant un compte, vous acceptez nos 
                        <a href="#" className="text-tasho-primary hover:underline"> Conditions d'utilisation</a> 
                        {' '}et notre 
                        <a href="#" className="text-tasho-primary hover:underline"> Politique de confidentialité</a>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}