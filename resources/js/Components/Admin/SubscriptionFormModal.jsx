import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FormDialog from '@/Components/Prime/FormDialog';
import FormField from '@/Components/Prime/FormField';

const capitalize = (value = '') =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

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
 * Modale de création / modification d'un abonnement.
 * `subscription` vaut null pour une création.
 */
export default function SubscriptionFormModal({
    visible,
    onHide,
    subscription = null,
    plans = [],
    users = [],
    billingCycles = ['monthly', 'yearly'],
    statuses = ['active', 'inactive', 'expired', 'cancelled'],
}) {
    const isEdit = Boolean(subscription);

    const form = useForm({
        user_id: '',
        plan_id: '',
        status: 'active',
        billing_cycle: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        amount: 0,
        payment_method: '',
        notes: '',
    });

    const { data, setData, processing, errors, reset, clearErrors } = form;

    useEffect(() => {
        if (!visible) {
            return;
        }

        clearErrors();

        if (subscription) {
            setData({
                user_id: subscription.user_id ?? subscription.user?.id ?? '',
                plan_id: subscription.plan_id ?? subscription.plan?.id ?? '',
                status: subscription.status || 'active',
                billing_cycle: subscription.billing_cycle || 'monthly',
                start_date:
                    subscription.start_date ||
                    new Date().toISOString().split('T')[0],
                end_date: subscription.end_date || '',
                amount: subscription.amount ?? 0,
                payment_method: subscription.payment_method || '',
                notes: subscription.notes || '',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, subscription?.id]);

    const userOptions = users.map((user) => ({
        label: `${user.name} (${user.email})`,
        value: user.id,
    }));

    const planOptions = plans.map((plan) => ({
        label: `${plan.name} — ${formatPrice(plan.price_monthly)}/mois`,
        value: plan.id,
    }));

    const statusOptions = statuses.map((status) => ({
        label: capitalize(status),
        value: status,
    }));

    const billingCycleOptions = billingCycles.map((cycle) => ({
        label: capitalize(cycle),
        value: cycle,
    }));

    const selectedPlan = plans.find(
        (plan) => String(plan.id) === String(data.plan_id),
    );
    const selectedUser = users.find(
        (user) => String(user.id) === String(data.user_id),
    );

    const syncAmount = (planId, cycle) => {
        const plan = plans.find((item) => String(item.id) === String(planId));

        if (!plan) {
            return;
        }

        setData(
            'amount',
            cycle === 'monthly' ? plan.price_monthly : plan.price_yearly,
        );
    };

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
            onSuccess: () => onHide?.(),
        };

        if (isEdit) {
            form.put(route('admin.subscriptions.update', subscription.id), options);
        } else {
            form.post(route('admin.subscriptions.store'), options);
        }
    };

    return (
        <FormDialog
            visible={visible}
            onHide={close}
            title={isEdit ? "Modifier l'abonnement" : 'Nouvel abonnement'}
            description={
                isEdit
                    ? "Mettez à jour les informations de l'abonnement."
                    : 'Créez un abonnement en francs burundais (FBU).'
            }
            icon={isEdit ? 'pi pi-pencil' : 'pi pi-plus'}
            formId="subscription-form"
            onSubmit={submit}
            submitLabel={isEdit ? 'Enregistrer' : "Créer l'abonnement"}
            processing={processing}
            width="44rem"
            closable={!processing}
        >
            <form id="subscription-form" onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label="Utilisateur"
                        htmlFor="subscription-user"
                        required
                        error={errors.user_id}
                        className="sm:col-span-2"
                    >
                        <Dropdown
                            inputId="subscription-user"
                            value={data.user_id}
                            options={userOptions}
                            onChange={(event) => setData('user_id', event.value)}
                            placeholder="Sélectionner un utilisateur"
                            filter
                            filterBy="label"
                            className={errors.user_id ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Plan"
                        htmlFor="subscription-plan"
                        required
                        error={errors.plan_id}
                    >
                        <Dropdown
                            inputId="subscription-plan"
                            value={data.plan_id}
                            options={planOptions}
                            onChange={(event) => {
                                setData('plan_id', event.value);
                                syncAmount(event.value, data.billing_cycle);
                            }}
                            placeholder="Sélectionner un plan"
                            className={errors.plan_id ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Statut"
                        htmlFor="subscription-status"
                        error={errors.status}
                    >
                        <Dropdown
                            inputId="subscription-status"
                            value={data.status}
                            options={statusOptions}
                            onChange={(event) => setData('status', event.value)}
                            className={errors.status ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Cycle de facturation"
                        htmlFor="subscription-cycle"
                        error={errors.billing_cycle}
                    >
                        <Dropdown
                            inputId="subscription-cycle"
                            value={data.billing_cycle}
                            options={billingCycleOptions}
                            onChange={(event) => {
                                setData('billing_cycle', event.value);
                                syncAmount(data.plan_id, event.value);
                            }}
                            className={errors.billing_cycle ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Date de début"
                        htmlFor="subscription-start-date"
                        required
                        error={errors.start_date}
                    >
                        <input
                            id="subscription-start-date"
                            type="date"
                            value={data.start_date}
                            onChange={(event) =>
                                setData('start_date', event.target.value)
                            }
                            className={`mt-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary ${
                                errors.start_date ? 'border-red-500' : ''
                            }`}
                            required
                        />
                    </FormField>

                    <FormField
                        label="Date de fin"
                        htmlFor="subscription-end-date"
                        error={errors.end_date}
                    >
                        <input
                            id="subscription-end-date"
                            type="date"
                            value={data.end_date}
                            onChange={(event) =>
                                setData('end_date', event.target.value)
                            }
                            className={`mt-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary ${
                                errors.end_date ? 'border-red-500' : ''
                            }`}
                        />
                    </FormField>

                    <FormField
                        label="Montant (FBU)"
                        htmlFor="subscription-amount"
                        required
                        error={errors.amount}
                        hint="Montant en Francs Burundais, sans décimale."
                    >
                        <InputNumber
                            inputId="subscription-amount"
                            value={Number(data.amount) || 0}
                            onValueChange={(event) =>
                                setData('amount', event.value ?? 0)
                            }
                            min={0}
                            showButtons={false}
                            locale="fr-FR"
                            className={errors.amount ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Méthode de paiement"
                        htmlFor="subscription-payment-method"
                        error={errors.payment_method}
                    >
                        <InputText
                            id="subscription-payment-method"
                            value={data.payment_method}
                            onChange={(event) =>
                                setData('payment_method', event.target.value)
                            }
                            placeholder="Mobile Money, virement, espèces…"
                            className={errors.payment_method ? 'p-invalid' : ''}
                        />
                    </FormField>

                    <FormField
                        label="Notes"
                        htmlFor="subscription-notes"
                        error={errors.notes}
                        className="sm:col-span-2"
                    >
                        <InputTextarea
                            id="subscription-notes"
                            value={data.notes}
                            onChange={(event) =>
                                setData('notes', event.target.value)
                            }
                            rows={2}
                            autoResize
                            placeholder="Informations complémentaires…"
                            className={errors.notes ? 'p-invalid' : ''}
                        />
                    </FormField>
                </div>

                {selectedPlan && Number(data.amount) > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                            Résumé
                        </h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Plan</span>
                                <span className="font-medium">
                                    {selectedPlan.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cycle</span>
                                <span className="font-medium">
                                    {capitalize(data.billing_cycle)}
                                </span>
                            </div>
                            {selectedUser && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Utilisateur
                                    </span>
                                    <span className="font-medium">
                                        {selectedUser.name}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="font-medium">Total</span>
                                <span className="font-bold text-tasho-primary">
                                    {formatPrice(parseInt(data.amount, 10))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </FormDialog>
    );
}
