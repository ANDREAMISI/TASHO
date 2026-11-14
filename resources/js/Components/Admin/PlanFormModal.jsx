import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';
import { CheckIcon } from '@/Components/Icons';

const FEATURE_OPTIONS = [
    { key: 'stockage_base', label: 'Stockage de base' },
    { key: 'partage_client', label: 'Partage client' },
    { key: 'commentaires', label: 'Commentaires' },
    { key: 'equipe', label: 'Collaboration équipe' },
    { key: 'audit', label: 'Audit complet' },
    { key: 'support_email', label: 'Support par email' },
    { key: 'permissions_avancees', label: 'Permissions avancées' },
    { key: 'api_access', label: 'Accès API' },
    { key: 'support_prioritaire', label: 'Support prioritaire' },
    { key: 'branding_personnalise', label: 'Branding personnalisé' },
];

const GB = 1024 ** 3;
const MB = 1024 ** 2;

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const toSlug = (value) =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const formatPrice = (price) => {
    if (!price || Number(price) === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-BI', {
        style: 'currency',
        currency: 'BIF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

/**
 * Modale de création / modification d'un plan.
 * `plan` vaut null pour une création.
 */
export default function PlanFormModal({ visible, onHide, plan = null }) {
    const isEdit = Boolean(plan);
    const [slugTouched, setSlugTouched] = useState(false);
    const [storageGb, setStorageGb] = useState(1);
    const [maxFileSizeMb, setMaxFileSizeMb] = useState(50);

    const form = useForm({
        name: '',
        slug: '',
        description: '',
        max_team_members: 1,
        max_projects: -1,
        price_monthly: 0,
        price_yearly: 0,
        is_active: true,
        sort_order: 0,
        features: {},
    });

    const { data, setData, processing, errors, reset, clearErrors } = form;

    useEffect(() => {
        if (!visible) {
            return;
        }

        clearErrors();

        if (plan) {
            setSlugTouched(true);
            setData({
                name: plan.name || '',
                slug: plan.slug || '',
                description: plan.description || '',
                max_team_members: plan.max_team_members ?? 1,
                max_projects: plan.max_projects ?? -1,
                price_monthly: plan.price_monthly ?? 0,
                price_yearly: plan.price_yearly ?? 0,
                is_active: Boolean(plan.is_active),
                sort_order: plan.sort_order ?? 0,
                features: plan.features || {},
            });
            setStorageGb(
                plan.storage_limit
                    ? Number((plan.storage_limit / GB).toFixed(2))
                    : 0,
            );
            setMaxFileSizeMb(
                plan.max_file_size
                    ? Number((plan.max_file_size / MB).toFixed(2))
                    : 0,
            );
        } else {
            setSlugTouched(false);
            reset();
            setStorageGb(1);
            setMaxFileSizeMb(50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, plan?.id]);

    const unlimitedMembers = toNumber(data.max_team_members) === -1;
    const unlimitedProjects = toNumber(data.max_projects) === -1;

    const close = () => {
        if (processing) {
            return;
        }

        onHide?.();
    };

    const handleNameChange = (value) => {
        setData('name', value);

        if (!slugTouched) {
            setData('slug', toSlug(value));
        }
    };

    const toggleFeature = (key) => {
        setData('features', {
            ...data.features,
            [key]: !data.features?.[key],
        });
    };

    const submit = (event) => {
        event.preventDefault();

        form.transform((values) => ({
            ...values,
            storage_limit: Math.round(toNumber(storageGb) * GB),
            max_file_size: Math.round(toNumber(maxFileSizeMb) * MB),
            max_team_members: unlimitedMembers
                ? -1
                : Math.max(0, Math.round(toNumber(values.max_team_members, 1))),
            max_projects: unlimitedProjects
                ? -1
                : Math.max(0, Math.round(toNumber(values.max_projects, 0))),
            price_monthly: Math.max(0, Math.round(toNumber(values.price_monthly))),
            price_yearly: Math.max(0, Math.round(toNumber(values.price_yearly))),
            sort_order: Math.round(toNumber(values.sort_order)),
        }));

        const options = {
            preserveScroll: true,
            onSuccess: () => onHide?.(),
        };

        if (isEdit) {
            form.put(route('admin.plans.update', plan.id), options);
        } else {
            form.post(route('admin.plans.store'), options);
        }
    };

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title={isEdit ? 'Modifier le plan' : 'Nouveau plan'}
            description={
                isEdit
                    ? 'Mettez à jour les caractéristiques du plan.'
                    : 'Créez un plan visible sur la page publique des tarifs.'
            }
            icon={isEdit ? 'pi pi-pencil' : 'pi pi-plus'}
            formId="plan-form"
            onSubmit={submit}
            submitLabel={isEdit ? 'Enregistrer' : 'Créer le plan'}
            processing={processing}
            width="48rem"
            closable={!processing}
        >
            <form id="plan-form" onSubmit={submit} className="space-y-5">
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Informations générales
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            label="Nom du plan"
                            htmlFor="plan-name"
                            required
                            error={errors.name}
                        >
                            <InputText
                                id="plan-name"
                                value={data.name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                placeholder="Ex. Starter"
                                className={errors.name ? 'p-invalid' : ''}
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="Identifiant (slug)"
                            htmlFor="plan-slug"
                            required
                            error={errors.slug}
                        >
                            <InputText
                                id="plan-slug"
                                value={data.slug}
                                onChange={(event) => {
                                    setSlugTouched(true);
                                    setData('slug', toSlug(event.target.value));
                                }}
                                placeholder="starter"
                                className={errors.slug ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Description"
                            htmlFor="plan-description"
                            error={errors.description}
                            className="sm:col-span-2"
                        >
                            <InputTextarea
                                id="plan-description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                rows={2}
                                autoResize
                                placeholder="Ex. Pour les freelances et petites structures"
                                className={errors.description ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Ordre d'affichage"
                            htmlFor="plan-sort-order"
                            error={errors.sort_order}
                            hint="Les plans sont triés du plus petit au plus grand."
                        >
                            <InputNumber
                                inputId="plan-sort-order"
                                value={Number(data.sort_order) || 0}
                                onValueChange={(event) =>
                                    setData('sort_order', event.value ?? 0)
                                }
                                showButtons={false}
                                locale="fr-FR"
                                className={errors.sort_order ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <div className="flex items-end">
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
                                    Afficher ce plan sur l'espace grand public
                                </span>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Limites du plan
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            label="Stockage (GB)"
                            htmlFor="plan-storage"
                            required
                            error={errors.storage_limit}
                        >
                            <InputNumber
                                inputId="plan-storage"
                                value={storageGb}
                                onValueChange={(event) => setStorageGb(event.value ?? 0)}
                                min={0}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                showButtons={false}
                                locale="fr-FR"
                                className={errors.storage_limit ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Taille max. par fichier (MB)"
                            htmlFor="plan-file-size"
                            required
                            error={errors.max_file_size}
                        >
                            <InputNumber
                                inputId="plan-file-size"
                                value={maxFileSizeMb}
                                onValueChange={(event) => setMaxFileSizeMb(event.value ?? 0)}
                                min={0}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                showButtons={false}
                                locale="fr-FR"
                                className={errors.max_file_size ? 'p-invalid' : ''}
                            />
                        </FormField>

                        <FormField
                            label="Membres de l'équipe"
                            htmlFor="plan-members"
                            error={errors.max_team_members}
                        >
                            <InputNumber
                                inputId="plan-members"
                                value={unlimitedMembers ? null : Number(data.max_team_members) || 0}
                                onValueChange={(event) =>
                                    setData('max_team_members', event.value ?? 0)
                                }
                                min={0}
                                showButtons={false}
                                locale="fr-FR"
                                disabled={unlimitedMembers}
                                className={errors.max_team_members ? 'p-invalid' : ''}
                            />
                            <label className="mt-2 flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={unlimitedMembers}
                                    onChange={(event) =>
                                        setData('max_team_members', event.target.checked ? -1 : 1)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                                />
                                <span className="ml-2 text-sm text-gray-600">Illimité</span>
                            </label>
                        </FormField>

                        <FormField
                            label="Projets"
                            htmlFor="plan-projects"
                            error={errors.max_projects}
                        >
                            <InputNumber
                                inputId="plan-projects"
                                value={unlimitedProjects ? null : Number(data.max_projects) || 0}
                                onValueChange={(event) =>
                                    setData('max_projects', event.value ?? 0)
                                }
                                min={0}
                                showButtons={false}
                                locale="fr-FR"
                                disabled={unlimitedProjects}
                                className={errors.max_projects ? 'p-invalid' : ''}
                            />
                            <label className="mt-2 flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={unlimitedProjects}
                                    onChange={(event) =>
                                        setData('max_projects', event.target.checked ? -1 : 0)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                                />
                                <span className="ml-2 text-sm text-gray-600">Illimité</span>
                            </label>
                        </FormField>
                    </div>
                </section>

                <section className="space-y-4 border-t border-gray-100 pt-5">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Tarifs
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Les montants sont exprimés en francs burundais (FBU).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            label="Prix mensuel (FBU)"
                            htmlFor="plan-price-monthly"
                            required
                            error={errors.price_monthly}
                        >
                            <InputNumber
                                inputId="plan-price-monthly"
                                value={Number(data.price_monthly) || 0}
                                onValueChange={(event) =>
                                    setData('price_monthly', event.value ?? 0)
                                }
                                min={0}
                                showButtons={false}
                                locale="fr-FR"
                                className={errors.price_monthly ? 'p-invalid' : ''}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formatPrice(data.price_monthly)}
                            </p>
                        </FormField>

                        <FormField
                            label="Prix annuel (FBU)"
                            htmlFor="plan-price-yearly"
                            required
                            error={errors.price_yearly}
                        >
                            <InputNumber
                                inputId="plan-price-yearly"
                                value={Number(data.price_yearly) || 0}
                                onValueChange={(event) =>
                                    setData('price_yearly', event.value ?? 0)
                                }
                                min={0}
                                showButtons={false}
                                locale="fr-FR"
                                className={errors.price_yearly ? 'p-invalid' : ''}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formatPrice(data.price_yearly)}
                            </p>
                        </FormField>
                    </div>
                </section>

                <section className="space-y-4 border-t border-gray-100 pt-5">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Fonctionnalités incluses
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Cochez les fonctionnalités disponibles avec ce plan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {FEATURE_OPTIONS.map((feature) => {
                            const checked = Boolean(data.features?.[feature.key]);

                            return (
                                <label
                                    key={feature.key}
                                    className={`flex cursor-pointer items-center rounded-lg border p-2.5 text-sm transition ${
                                        checked
                                            ? 'border-tasho-primary bg-tasho-primary/5 text-gray-900'
                                            : 'border-gray-200 text-gray-600'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleFeature(feature.key)}
                                        className="h-4 w-4 rounded border-gray-300 text-tasho-primary focus:ring-tasho-primary"
                                    />
                                    <span className="ml-2">{feature.label}</span>
                                    {checked && (
                                        <CheckIcon className="ml-auto h-4 w-4 text-tasho-primary" />
                                    )}
                                </label>
                            );
                        })}
                    </div>
                    {errors.features && (
                        <p className="text-xs text-red-600">{errors.features}</p>
                    )}
                </section>
            </form>
        </FormDialog>
    );
}
