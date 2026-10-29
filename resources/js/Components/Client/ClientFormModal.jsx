import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

/**
 * Modale de création / modification d'un client.
 * `client` vaut null pour une création.
 */
export default function ClientFormModal({ visible, onHide, client = null }) {
    const isEdit = Boolean(client);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
    });

    useEffect(() => {
        if (!visible) {
            return;
        }

        clearErrors();

        if (client) {
            setData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                company: client.company || '',
                notes: client.notes || '',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, client?.id]);

    const close = () => {
        if (processing) {
            return;
        }

        onHide?.();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) {
                    reset();
                }
                onHide?.();
            },
        };

        if (isEdit) {
            put(route('clients.update', client.id), options);
        } else {
            post(route('clients.store'), options);
        }
    };

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title={isEdit ? 'Modifier le client' : 'Nouveau client'}
            description={
                isEdit
                    ? 'Mettez à jour les coordonnées du client.'
                    : 'Ajoutez un client à votre espace de travail.'
            }
            icon={isEdit ? 'pi pi-user-edit' : 'pi pi-user-plus'}
            formId="client-form"
            onSubmit={submit}
            submitLabel={isEdit ? 'Enregistrer' : 'Créer le client'}
            processing={processing}
            width="36rem"
            closable={!processing}
        >
            <form id="client-form" onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label="Nom complet"
                        htmlFor="client-name"
                        required
                        error={errors.name}
                        className="sm:col-span-2"
                    >
                        <InputText
                            id="client-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="Ex : Sarah Dupont"
                            className={errors.name ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Email"
                        htmlFor="client-email"
                        required
                        error={errors.email}
                    >
                        <InputText
                            id="client-email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="client@exemple.com"
                            className={errors.email ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Téléphone"
                        htmlFor="client-phone"
                        error={errors.phone}
                    >
                        <InputText
                            id="client-phone"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                            placeholder="+243 …"
                            className={errors.phone ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Entreprise"
                        htmlFor="client-company"
                        error={errors.company}
                        className="sm:col-span-2"
                    >
                        <InputText
                            id="client-company"
                            value={data.company}
                            onChange={(event) => setData('company', event.target.value)}
                            placeholder="Ex : Studio Amisi"
                            className={errors.company ? 'p-invalid' : ''}
                        />
                    </FormField>
                </div>

                <FormField label="Notes internes" htmlFor="client-notes" error={errors.notes}>
                    <InputTextarea
                        id="client-notes"
                        value={data.notes}
                        onChange={(event) => setData('notes', event.target.value)}
                        rows={3}
                        autoResize
                        placeholder="Préférences, contexte, informations utiles…"
                        className={errors.notes ? 'p-invalid' : ''}
                    />
                </FormField>
            </form>
        </FormDialog>
    );
}
