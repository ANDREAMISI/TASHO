import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

const DEFAULT_VALUES = {
    site_name: 'TASHO',
    site_email: 'admin@tasho.com',
    maintenance_mode: false,
    registration_enabled: true,
    max_file_size: 500,
    allowed_file_types: [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'application/pdf',
    ],
};

/**
 * Modale de configuration générale de la plateforme.
 */
export default function SettingsFormModal({ visible, onHide, settings = null }) {
    const form = useForm({
        ...DEFAULT_VALUES,
        ...(settings || {}),
    });

    const { data, setData, processing, errors, reset, clearErrors } = form;

    useEffect(() => {
        if (!visible) {
            return;
        }

        clearErrors();

        if (settings) {
            setData({
                ...DEFAULT_VALUES,
                ...settings,
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const close = () => {
        if (processing) {
            return;
        }

        onHide?.();
    };

    const submit = (event) => {
        event.preventDefault();

        form.put(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => onHide?.(),
        });
    };

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title="Configuration générale"
            description="Paramètres globaux de la plateforme."
            icon="pi pi-cog"
            formId="admin-settings-form"
            onSubmit={submit}
            submitLabel="Enregistrer"
            processing={processing}
            width="38rem"
            closable={!processing}
        >
            <form id="admin-settings-form" onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label="Nom du site"
                        htmlFor="admin-settings-site-name"
                        error={errors.site_name}
                    >
                        <InputText
                            id="admin-settings-site-name"
                            value={data.site_name}
                            onChange={(event) =>
                                setData('site_name', event.target.value)
                            }
                            className={errors.site_name ? 'p-invalid' : ''}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="Email de contact"
                        htmlFor="admin-settings-site-email"
                        error={errors.site_email}
                    >
                        <InputText
                            id="admin-settings-site-email"
                            type="email"
                            value={data.site_email}
                            onChange={(event) =>
                                setData('site_email', event.target.value)
                            }
                            className={errors.site_email ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Taille max. des fichiers (MB)"
                        htmlFor="admin-settings-max-file-size"
                        error={errors.max_file_size}
                    >
                        <InputNumber
                            inputId="admin-settings-max-file-size"
                            value={Number(data.max_file_size) || 0}
                            onValueChange={(event) =>
                                setData('max_file_size', event.value ?? 0)
                            }
                            min={0}
                            showButtons={false}
                            locale="fr-FR"
                            className={errors.max_file_size ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <div className="flex flex-col justify-end gap-2 pb-1">
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={Boolean(data.maintenance_mode)}
                                onChange={(event) =>
                                    setData(
                                        'maintenance_mode',
                                        event.target.checked,
                                    )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Mode maintenance
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={Boolean(data.registration_enabled)}
                                onChange={(event) =>
                                    setData(
                                        'registration_enabled',
                                        event.target.checked,
                                    )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Inscriptions autorisées
                            </span>
                        </label>
                    </div>
                </div>

                <FormField
                    label="Types de fichiers autorisés"
                    htmlFor="admin-settings-file-types"
                    error={errors.allowed_file_types}
                    hint="Séparez les types MIME par des virgules."
                >
                    <InputTextarea
                        id="admin-settings-file-types"
                        value={(data.allowed_file_types || []).join(', ')}
                        onChange={(event) =>
                            setData(
                                'allowed_file_types',
                                event.target.value
                                    .split(',')
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                            )
                        }
                        rows={3}
                        placeholder="image/jpeg, image/png, video/mp4"
                        className={errors.allowed_file_types ? 'p-invalid' : ''}
                    />
                </FormField>
            </form>
        </FormDialog>
    );
}
