import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

/**
 * Modale de modification d'un utilisateur (espace administration).
 * `user` doit contenir au minimum id, name, email et is_active.
 */
export default function UserFormModal({ visible, onHide, user = null }) {
    const form = useForm({
        name: '',
        email: '',
        is_active: true,
    });

    const { data, setData, processing, errors, clearErrors } = form;

    useEffect(() => {
        if (!visible || !user) {
            return;
        }

        clearErrors();
        setData({
            name: user.name || '',
            email: user.email || '',
            is_active: Boolean(user.is_active),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, user?.id]);

    const close = () => {
        if (processing) {
            return;
        }

        onHide?.();
    };

    const submit = (event) => {
        event.preventDefault();

        form.put(route('admin.users.update', user.id), {
            preserveScroll: true,
            onSuccess: () => onHide?.(),
        });
    };

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title="Modifier l'utilisateur"
            description="Mettez à jour les informations du compte."
            icon="pi pi-user-edit"
            formId="admin-user-form"
            onSubmit={submit}
            submitLabel="Enregistrer"
            processing={processing}
            width="34rem"
            closable={!processing}
        >
            <form id="admin-user-form" onSubmit={submit} className="space-y-5">
                <FormField
                    label="Nom complet"
                    htmlFor="admin-user-name"
                    required
                    error={errors.name}
                >
                    <InputText
                        id="admin-user-name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className={errors.name ? 'p-invalid' : ''}
                        autoFocus
                    />
                </FormField>

                <FormField
                    label="Email"
                    htmlFor="admin-user-email"
                    required
                    error={errors.email}
                >
                    <InputText
                        id="admin-user-email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className={errors.email ? 'p-invalid' : ''}
                    />
                </FormField>

                <label className="flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        checked={Boolean(data.is_active)}
                        onChange={(event) =>
                            setData('is_active', event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                        Compte actif
                    </span>
                </label>
            </form>
        </FormDialog>
    );
}
