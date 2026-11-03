import { useForm } from '@inertiajs/react';
import FormDialog from '@/Components/Prime/FormDialog';

const initialPlan = (plan) => ({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    price_monthly: plan?.price_monthly ?? 0,
    price_yearly: plan?.price_yearly ?? 0,
    currency: plan?.currency || '',
});

export default function PlanFormDialog({ visible, onHide, plan }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(
        initialPlan(plan),
    );

    const close = (afterSubmit = false) => {
        if (processing && !afterSubmit) return;
        onHide();
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => close(true) };

        if (plan) {
            put(route('admin.plans.update', plan.id), options);
        } else {
            post(route('admin.plans.store'), options);
        }
    };

    const formId = `plan-form-${plan?.id || 'new'}`;

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title={plan ? 'Modifier le plan' : 'Nouveau plan'}
            description="Configurez les tarifs mensuel et annuel ainsi que la devise."
            icon="pi pi-wallet"
            formId={formId}
            onSubmit={submit}
            processing={processing}
            width="48rem"
        >
            <form id={formId} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom" error={errors.name}>
                    <input
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className={inputClass}
                        required
                    />
                </Field>
                <Field label="Identifiant (slug)" error={errors.slug}>
                    <input
                        value={data.slug}
                        onChange={(event) => setData('slug', event.target.value)}
                        className={inputClass}
                        required
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Description" error={errors.description}>
                        <textarea
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            className={inputClass}
                            rows={2}
                        />
                    </Field>
                </div>

                <Field label="Prix mensuel" error={errors.price_monthly}>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={data.price_monthly}
                        onChange={(event) => setData('price_monthly', event.target.value)}
                        className={inputClass}
                        required
                    />
                </Field>
                <Field label="Prix annuel" error={errors.price_yearly}>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={data.price_yearly}
                        onChange={(event) => setData('price_yearly', event.target.value)}
                        className={inputClass}
                        required
                    />
                </Field>
                <Field label="Devise (facultative)" error={errors.currency}>
                    <input
                        value={data.currency}
                        onChange={(event) => setData('currency', event.target.value.toUpperCase())}
                        className={inputClass}
                        maxLength={3}
                        placeholder="FBU"
                    />
                </Field>
            </form>
        </FormDialog>
    );
}

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary';

function Field({ label, error, children }) {
    return (
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {children}
            {error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}
        </label>
    );
}
