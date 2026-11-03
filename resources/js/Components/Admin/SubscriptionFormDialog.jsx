import { useForm } from '@inertiajs/react';
import FormDialog from '@/Components/Prime/FormDialog';

const today = () => {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

function calculateEndDate(startDate, billingCycle) {
    if (!startDate) return '';

    const [year, month, day] = startDate.split('-').map(Number);
    const end = new Date(year, month - 1 + (billingCycle === 'yearly' ? 12 : 1), 1);
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    end.setDate(Math.min(day, lastDay));

    return [
        end.getFullYear(),
        String(end.getMonth() + 1).padStart(2, '0'),
        String(end.getDate()).padStart(2, '0'),
    ].join('-');
}

function formatPrice(amount, currency) {
    const formatted = new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

    return `${formatted} ${currency || 'FBU'}`;
}

export default function SubscriptionFormDialog({
    visible,
    onHide,
    subscription,
    plans,
    users,
    statuses,
}) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        user_id: subscription?.user_id || '',
        plan_id: subscription?.plan_id || '',
        status: subscription?.status || 'active',
        billing_cycle: subscription?.billing_cycle || 'monthly',
        start_date: subscription?.start_date || today(),
        amount: subscription?.amount ?? '',
        currency: subscription?.currency || 'FBU',
        payment_method: subscription?.payment_method || '',
        notes: subscription?.notes || '',
    });

    const close = (afterSubmit = false) => {
        if (processing && !afterSubmit) return;
        onHide();
        reset();
        clearErrors();
    };

    const updatePlan = (planId, billingCycle = data.billing_cycle) => {
        const plan = plans.find((item) => String(item.id) === String(planId));
        if (!plan) return;

        setData({
            ...data,
            plan_id: planId,
            amount: billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly,
            currency: plan.currency || 'FBU',
        });
    };

    const updateCycle = (billingCycle) => {
        const plan = plans.find((item) => String(item.id) === String(data.plan_id));
        setData({
            ...data,
            billing_cycle: billingCycle,
            ...(plan
                ? {
                      amount:
                          billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly,
                      currency: plan.currency || 'FBU',
                  }
                : {}),
        });
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => close(true),
        };

        if (subscription) {
            put(route('admin.subscriptions.update', subscription.id), options);
        } else {
            post(route('admin.subscriptions.store'), options);
        }
    };

    const formId = `subscription-form-${subscription?.id || 'new'}`;
    const calculatedEndDate = calculateEndDate(data.start_date, data.billing_cycle);

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title={subscription ? 'Modifier l’abonnement' : 'Nouvel abonnement'}
            description="La date de fin est calculée selon la date de début et le cycle."
            icon="pi pi-credit-card"
            formId={formId}
            onSubmit={submit}
            processing={processing}
            width="44rem"
        >
            <form id={formId} onSubmit={submit} className="space-y-4">
                {!subscription ? (
                    <Field label="Utilisateur" error={errors.user_id}>
                        <select
                            value={data.user_id}
                            onChange={(event) => setData('user_id', event.target.value)}
                            className={inputClass}
                            required
                        >
                            <option value="">Sélectionner un utilisateur</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </Field>
                ) : (
                    <Field label="Utilisateur">
                        <input
                            value={subscription.user_name || 'Utilisateur'}
                            className={inputClass}
                            readOnly
                        />
                    </Field>
                )}

                <Field label="Plan" error={errors.plan_id}>
                    <select
                        value={data.plan_id}
                        onChange={(event) => updatePlan(event.target.value)}
                        className={inputClass}
                        required
                    >
                        <option value="">Sélectionner un plan</option>
                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name}
                            </option>
                        ))}
                    </select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Statut" error={errors.status}>
                        <select
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                            className={inputClass}
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Cycle de facturation" error={errors.billing_cycle}>
                        <select
                            value={data.billing_cycle}
                            onChange={(event) => updateCycle(event.target.value)}
                            className={inputClass}
                        >
                            <option value="monthly">Mensuel</option>
                            <option value="yearly">Annuel</option>
                        </select>
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date de début" error={errors.start_date}>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(event) => setData('start_date', event.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>
                    <Field label="Date de fin calculée">
                        <input value={calculatedEndDate} className={inputClass} readOnly />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Montant" error={errors.amount}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={data.amount}
                            onChange={(event) => setData('amount', event.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>
                    <Field label="Devise (facultative)" error={errors.currency}>
                        <input
                            value={data.currency}
                            onChange={(event) => setData('currency', event.target.value.toUpperCase())}
                            maxLength={3}
                            placeholder="FBU"
                            className={inputClass}
                        />
                    </Field>
                </div>
                {data.amount !== '' && (
                    <p className="-mt-2 text-xs text-gray-500">
                        Montant sélectionné : {formatPrice(data.amount, data.currency)}
                    </p>
                )}

                <Field label="Mode de paiement" error={errors.payment_method}>
                    <input
                        value={data.payment_method}
                        onChange={(event) => setData('payment_method', event.target.value)}
                        className={inputClass}
                        maxLength={100}
                        placeholder="Mobile Money, virement, espèces..."
                    />
                </Field>

                <Field label="Notes" error={errors.notes}>
                    <textarea
                        value={data.notes}
                        onChange={(event) => setData('notes', event.target.value)}
                        className={inputClass}
                        rows={3}
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
