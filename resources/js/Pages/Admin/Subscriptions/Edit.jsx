import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon, CurrencyDollarIcon, UserIcon, CreditCardIcon } from '@/Components/Icons';

export default function SubscriptionsEdit({ auth, subscription, plans, users, billingCycles, statuses }) {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        user_id: subscription.user_id || '',
        plan_id: subscription.plan_id || '',
        status: subscription.status || 'active',
        billing_cycle: subscription.billing_cycle || 'monthly',
        start_date: subscription.start_date || new Date().toISOString().split('T')[0],
        end_date: subscription.end_date || '',
        amount: subscription.amount || '',
        payment_method: subscription.payment_method || '',
        notes: subscription.notes || '',
    });

    useEffect(() => {
        if (selectedPlan) {
            const amount = data.billing_cycle === 'monthly' 
                ? selectedPlan.price_monthly 
                : selectedPlan.price_yearly;
            setData('amount', amount);
        }
    }, [selectedPlan, data.billing_cycle]);

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        setData('plan_id', planId);
        const plan = plans.find(p => p.id == planId);
        setSelectedPlan(plan);
    };

    const handleUserChange = (e) => {
        const userId = e.target.value;
        setData('user_id', userId);
        const user = users.find(u => u.id == userId);
        setSelectedUser(user);
    };

    const handleBillingCycleChange = (e) => {
        setData('billing_cycle', e.target.value);
    };

    const formatPrice = (price) => {
        if (price === 0) return 'Gratuit';
        return new Intl.NumberFormat('fr-BI', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.subscriptions.update', subscription.id));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Modifier l'abonnement - Administration" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Modifier l'abonnement</h1>
                            <p className="text-sm text-gray-500">
                                Modifiez les informations de l'abonnement
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Utilisateur */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <UserIcon className="h-4 w-4 inline mr-1 text-gray-400" />
                                    Utilisateur *
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={handleUserChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    required
                                >
                                    <option value="">Sélectionner un utilisateur</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>}
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <CreditCardIcon className="h-4 w-4 inline mr-1 text-gray-400" />
                                    Plan *
                                </label>
                                <select
                                    value={data.plan_id}
                                    onChange={handlePlanChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    required
                                >
                                    <option value="">Sélectionner un plan</option>
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - {formatPrice(plan.price_monthly)}/mois
                                        </option>
                                    ))}
                                </select>
                                {errors.plan_id && <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>}
                            </div>

                            {/* Statut et Cycle */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cycle de facturation
                                    </label>
                                    <select
                                        value={data.billing_cycle}
                                        onChange={handleBillingCycleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    >
                                        {billingCycles.map((cycle) => (
                                            <option key={cycle} value={cycle}>
                                                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date de début *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        required
                                    />
                                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    />
                                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                </div>
                            </div>

                            {/* Montant */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <CurrencyDollarIcon className="h-4 w-4 inline mr-1 text-gray-400" />
                                    Montant (FBU) *
                                </label>
                                <div className="mt-1 relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                        FBU
                                    </span>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="pl-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                        placeholder="0"
                                        min="0"
                                        step="1"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Montant en Francs Burundais (FBU). Aucune décimale.
                                </p>
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            {/* Méthode de paiement */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Méthode de paiement
                                </label>
                                <input
                                    type="text"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Mobile Money, Virement bancaire, Espèces..."
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary"
                                    placeholder="Informations complémentaires..."
                                />
                            </div>

                            {/* Résumé */}
                            {selectedPlan && data.amount > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Résumé</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Plan</span>
                                            <span className="font-medium">{selectedPlan.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Cycle</span>
                                            <span className="font-medium">{data.billing_cycle}</span>
                                        </div>
                                        {selectedUser && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Utilisateur</span>
                                                <span className="font-medium">{selectedUser.name}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="font-medium">Total</span>
                                            <span className="font-bold text-tasho-primary">
                                                {formatPrice(parseInt(data.amount))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Boutons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-tasho-primary rounded-md hover:bg-tasho-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}