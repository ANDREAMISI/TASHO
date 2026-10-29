import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

export default function ProfileEdit({ mustVerifyEmail = false }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [profileOpen, setProfileOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const openProfile = () => {
        profileForm.setData({
            name: user.name || '',
            email: user.email || '',
        });
        profileForm.clearErrors();
        setProfileOpen(true);
    };

    const closeProfile = () => {
        if (profileForm.processing) {
            return;
        }

        setProfileOpen(false);
        profileForm.clearErrors();
    };

    const submitProfile = (event) => {
        event.preventDefault();

        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setProfileOpen(false),
        });
    };

    const openPassword = () => {
        passwordForm.reset();
        passwordForm.clearErrors();
        setPasswordOpen(true);
    };

    const closePassword = () => {
        if (passwordForm.processing) {
            return;
        }

        setPasswordOpen(false);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    const submitPassword = (event) => {
        event.preventDefault();

        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordOpen(false);
                passwordForm.reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                }

                if (errors.current_password) {
                    passwordForm.reset('current_password');
                }
            },
        });
    };

    const openDelete = () => {
        deleteForm.reset();
        deleteForm.clearErrors();
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        if (deleteForm.processing) {
            return;
        }

        setDeleteOpen(false);
        deleteForm.reset();
        deleteForm.clearErrors();
    };

    const submitDelete = (event) => {
        event.preventDefault();

        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    };

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Mon profil - TASHO" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Mon profil
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez vos informations personnelles et la sécurité de votre compte.
                    </p>
                </header>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-gray-900">
                                Informations personnelles
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Votre nom et votre adresse email de connexion.
                            </p>

                            <dl className="mt-4 space-y-1 text-sm">
                                <div className="flex gap-2">
                                    <dt className="w-20 text-gray-500">Nom</dt>
                                    <dd className="font-medium text-gray-900">{user.name}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="w-20 text-gray-500">Email</dt>
                                    <dd className="break-all font-medium text-gray-900">
                                        {user.email}
                                    </dd>
                                </div>
                            </dl>

                            {mustVerifyEmail && !user.email_verified_at && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
                                    Votre adresse email n'est pas encore vérifiée. Consultez votre
                                    boîte de réception pour activer toutes les fonctionnalités.
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            label="Modifier"
                            icon="pi pi-pencil"
                            severity="secondary"
                            outlined
                            onClick={openProfile}
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                Mot de passe
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Utilisez un mot de passe long et unique pour protéger votre compte.
                            </p>
                        </div>

                        <Button
                            type="button"
                            label="Changer"
                            icon="pi pi-lock"
                            severity="secondary"
                            outlined
                            onClick={openPassword}
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-red-700">
                                Supprimer le compte
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Cette action est définitive : vos projets, fichiers et partages
                                seront supprimés.
                            </p>
                        </div>

                        <Button
                            type="button"
                            label="Supprimer"
                            icon="pi pi-trash"
                            severity="danger"
                            outlined
                            onClick={openDelete}
                        />
                    </div>
                </section>
            </div>

            <FormDialog
                visible={profileOpen}
                onHide={closeProfile}
                title="Informations personnelles"
                description="Mettez à jour votre nom et votre email."
                icon="pi pi-user-edit"
                formId="profile-form"
                onSubmit={submitProfile}
                submitLabel={profileForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                processing={profileForm.processing}
                width="34rem"
                closable={!profileForm.processing}
            >
                <form id="profile-form" onSubmit={submitProfile} className="space-y-5">
                    <FormField
                        label="Nom"
                        htmlFor="profile-name"
                        required
                        error={profileForm.errors.name}
                    >
                        <InputText
                            id="profile-name"
                            value={profileForm.data.name}
                            onChange={(event) =>
                                profileForm.setData('name', event.target.value)
                            }
                            className={profileForm.errors.name ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Email"
                        htmlFor="profile-email"
                        required
                        error={profileForm.errors.email}
                        hint="Une modification vous demandera de vérifier votre email."
                    >
                        <InputText
                            id="profile-email"
                            type="email"
                            value={profileForm.data.email}
                            onChange={(event) =>
                                profileForm.setData('email', event.target.value)
                            }
                            className={profileForm.errors.email ? 'p-invalid' : ''}
                        />
                    </FormField>
                </form>
            </FormDialog>

            <FormDialog
                visible={passwordOpen}
                onHide={closePassword}
                title="Changer le mot de passe"
                description="Confirmez votre mot de passe actuel pour continuer."
                icon="pi pi-lock"
                formId="password-form"
                onSubmit={submitPassword}
                submitLabel={passwordForm.processing ? 'Mise à jour…' : 'Mettre à jour'}
                processing={passwordForm.processing}
                width="34rem"
                closable={!passwordForm.processing}
            >
                <form id="password-form" onSubmit={submitPassword} className="space-y-5">
                    <FormField
                        label="Mot de passe actuel"
                        htmlFor="current-password"
                        required
                        error={passwordForm.errors.current_password}
                    >
                        <Password
                            inputId="current-password"
                            value={passwordForm.data.current_password}
                            onChange={(event) =>
                                passwordForm.setData('current_password', event.target.value)
                            }
                            toggleMask
                            feedback={false}
                            className={passwordForm.errors.current_password ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Nouveau mot de passe"
                        htmlFor="new-password"
                        required
                        error={passwordForm.errors.password}
                    >
                        <Password
                            inputId="new-password"
                            value={passwordForm.data.password}
                            onChange={(event) =>
                                passwordForm.setData('password', event.target.value)
                            }
                            toggleMask
                            className={passwordForm.errors.password ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Confirmer le mot de passe"
                        htmlFor="confirm-password"
                        required
                    >
                        <Password
                            inputId="confirm-password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(event) =>
                                passwordForm.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            toggleMask
                            feedback={false}
                        />
                    </FormField>
                </form>
            </FormDialog>

            <FormDialog
                visible={deleteOpen}
                onHide={closeDelete}
                title="Supprimer le compte"
                description="Cette action est irréversible."
                icon="pi pi-exclamation-triangle"
                formId="delete-account-form"
                onSubmit={submitDelete}
                submitLabel={deleteForm.processing ? 'Suppression…' : 'Supprimer définitivement'}
                submitIcon="pi pi-trash"
                processing={deleteForm.processing}
                danger
                width="34rem"
                closable={!deleteForm.processing}
            >
                <form id="delete-account-form" onSubmit={submitDelete} className="space-y-5">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                        Tous vos projets, fichiers et liens de partage seront définitivement
                        supprimés.
                    </div>

                    <FormField
                        label="Confirmez avec votre mot de passe"
                        htmlFor="delete-password"
                        required
                        error={deleteForm.errors.password}
                    >
                        <Password
                            inputId="delete-password"
                            value={deleteForm.data.password}
                            onChange={(event) =>
                                deleteForm.setData('password', event.target.value)
                            }
                            toggleMask
                            feedback={false}
                            className={deleteForm.errors.password ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>
                </form>
            </FormDialog>
        </AuthenticatedLayout>
    );
}
