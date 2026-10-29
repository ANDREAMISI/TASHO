import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'active', label: 'Actif' },
    { value: 'completed', label: 'Terminé' },
    { value: 'archived', label: 'Archivé' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
];

const CLIENT_MODE_OPTIONS = [
    { value: 'new', label: 'Nouveau client' },
    { value: 'existing', label: 'Client existant' },
];

const STEP_FIELDS = [
    ['title', 'description', 'status', 'priority'],
    ['client_id', 'client_name', 'client_email'],
    ['start_date', 'end_date'],
];

const toDate = (value) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const toIsoDate = (date) => {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export default function ProjectFormModal({
    visible,
    onHide,
    clients = [],
    teamName,
}) {
    const stepperRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0);
    const [clientMode, setClientMode] = useState('new');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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

    const clientOptions = clients.map((client) => ({
        value: client.id,
        label: client.email ? `${client.name} — ${client.email}` : client.name,
    }));

    const resetForm = () => {
        reset();
        clearErrors();
        setClientMode('new');
        setActiveStep(0);
        stepperRef.current?.setActiveStep?.(0);
    };

    useEffect(() => {
        if (!visible) {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const close = () => {
        if (processing) {
            return;
        }

        onHide?.();
    };

    const goToStep = (index) => {
        setActiveStep(index);
        stepperRef.current?.setActiveStep?.(index);
    };

    const handleClientMode = (mode) => {
        setClientMode(mode);

        if (mode === 'new') {
            setData('client_id', '');
        } else {
            setData('client_name', '');
            setData('client_email', '');
        }
    };

    const submit = (event) => {
        event?.preventDefault?.();

        post(route('projects.store'), {
            preserveScroll: true,
            onSuccess: () => {
                close();
                resetForm();
            },
            onError: (validationErrors) => {
                const keys = Object.keys(validationErrors);
                const stepIndex = STEP_FIELDS.findIndex((fields) =>
                    fields.some((field) => keys.includes(field)),
                );

                if (stepIndex >= 0) {
                    goToStep(stepIndex);
                }
            },
        });
    };

    const footer = (
        <div className="flex items-center justify-between gap-2">
            <Button
                type="button"
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                text
                onClick={close}
                disabled={processing}
            />

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    label="Précédent"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    outlined
                    onClick={() => stepperRef.current?.prevCallback?.()}
                    disabled={processing || activeStep === 0}
                />

                <Button
                    type="button"
                    label={
                        activeStep < 2
                            ? 'Suivant'
                            : processing
                              ? 'Création…'
                              : 'Créer le projet'
                    }
                    icon={activeStep < 2 ? 'pi pi-arrow-right' : 'pi pi-check'}
                    iconPos="right"
                    loading={processing}
                    disabled={processing}
                    className="!bg-tasho-primary !border-tasho-primary"
                    onClick={(event) => {
                        if (activeStep < 2) {
                            stepperRef.current?.nextCallback?.();
                            return;
                        }

                        submit(event);
                    }}
                />
            </div>
        </div>
    );

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title="Nouveau projet"
            description={teamName ? `Espace ${teamName}` : 'Créez un espace de travail'}
            icon="pi pi-folder-plus"
            formId="project-form"
            onSubmit={submit}
            footer={footer}
            width="42rem"
            closable={!processing}
        >
            <form id="project-form" onSubmit={submit}>
                <Stepper
                    ref={stepperRef}
                    activeStep={activeStep}
                    onChangeStep={(event) => setActiveStep(event.index)}
                >
                    <StepperPanel header="Informations">
                        <div className="space-y-5 pt-2">
                            <FormField
                                label="Titre du projet"
                                htmlFor="project-title"
                                required
                                error={errors.title}
                            >
                                <InputText
                                    id="project-title"
                                    value={data.title}
                                    onChange={(event) => setData('title', event.target.value)}
                                    placeholder="Ex : Mariage Sarah 2026"
                                    className={errors.title ? 'p-invalid' : ''}
                                    autoFocus
                                />
                            </FormField>

                            <FormField
                                label="Description"
                                htmlFor="project-description"
                                error={errors.description}
                                hint="500 caractères maximum."
                            >
                                <InputTextarea
                                    id="project-description"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    rows={3}
                                    autoResize
                                    maxLength={500}
                                    placeholder="Décrivez le projet en quelques mots…"
                                    className={errors.description ? 'p-invalid' : ''}
                                />
                            </FormField>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Statut" htmlFor="project-status" error={errors.status}>
                                    <Dropdown
                                        inputId="project-status"
                                        value={data.status}
                                        options={STATUS_OPTIONS}
                                        onChange={(event) => setData('status', event.value)}
                                        placeholder="Choisir un statut"
                                    />
                                </FormField>

                                <FormField
                                    label="Priorité"
                                    htmlFor="project-priority"
                                    error={errors.priority}
                                >
                                    <Dropdown
                                        inputId="project-priority"
                                        value={data.priority}
                                        options={PRIORITY_OPTIONS}
                                        onChange={(event) => setData('priority', event.value)}
                                        placeholder="Choisir une priorité"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </StepperPanel>

                    <StepperPanel header="Client">
                        <div className="space-y-5 pt-2">
                            <div className="flex flex-wrap gap-2">
                                {CLIENT_MODE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleClientMode(option.value)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                                            clientMode === option.value
                                                ? 'bg-tasho-primary text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {clientMode === 'existing' ? (
                                <FormField
                                    label="Client"
                                    htmlFor="project-client"
                                    error={errors.client_id}
                                    hint={
                                        clientOptions.length === 0
                                            ? 'Aucun client enregistré pour le moment.'
                                            : undefined
                                    }
                                >
                                    <Dropdown
                                        inputId="project-client"
                                        value={data.client_id}
                                        options={clientOptions}
                                        onChange={(event) => setData('client_id', event.value)}
                                        placeholder="Sélectionner un client"
                                        filter
                                        emptyMessage="Aucun client trouvé"
                                        disabled={clientOptions.length === 0}
                                    />
                                </FormField>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        label="Nom du client"
                                        htmlFor="project-client-name"
                                        error={errors.client_name}
                                    >
                                        <InputText
                                            id="project-client-name"
                                            value={data.client_name}
                                            onChange={(event) =>
                                                setData('client_name', event.target.value)
                                            }
                                            placeholder="Ex : Sarah Dupont"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Email du client"
                                        htmlFor="project-client-email"
                                        error={errors.client_email}
                                    >
                                        <InputText
                                            id="project-client-email"
                                            type="email"
                                            value={data.client_email}
                                            onChange={(event) =>
                                                setData('client_email', event.target.value)
                                            }
                                            placeholder="client@exemple.com"
                                        />
                                    </FormField>
                                </div>
                            )}

                            <p className="rounded-lg bg-gray-50 px-3.5 py-3 text-xs text-gray-500">
                                Le client pourra recevoir un lien de partage sécurisé une fois le
                                projet créé. Vous pourrez aussi l'associer plus tard.
                            </p>
                        </div>
                    </StepperPanel>

                    <StepperPanel header="Planification">
                        <div className="space-y-5 pt-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Date de début"
                                    htmlFor="project-start"
                                    error={errors.start_date}
                                >
                                    <Calendar
                                        inputId="project-start"
                                        value={toDate(data.start_date)}
                                        onChange={(event) =>
                                            setData('start_date', toIsoDate(event.value))
                                        }
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        placeholder="jj/mm/aaaa"
                                    />
                                </FormField>

                                <FormField
                                    label="Date de fin"
                                    htmlFor="project-end"
                                    error={errors.end_date}
                                >
                                    <Calendar
                                        inputId="project-end"
                                        value={toDate(data.end_date)}
                                        onChange={(event) =>
                                            setData('end_date', toIsoDate(event.value))
                                        }
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        minDate={toDate(data.start_date) || undefined}
                                        placeholder="jj/mm/aaaa"
                                    />
                                </FormField>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Récapitulatif
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {data.title || 'Projet sans titre'}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {clientMode === 'existing'
                                        ? clientOptions.find((option) => option.value === data.client_id)
                                              ?.label || 'Aucun client sélectionné'
                                        : data.client_name || 'Aucun client renseigné'}
                                </p>
                            </div>

                            <p className="text-xs text-gray-500">
                                Les dates sont facultatives. Vous pourrez les modifier depuis le
                                projet.
                            </p>
                        </div>
                    </StepperPanel>
                </Stepper>
            </form>
        </FormDialog>
    );
}
