import { Head, Link } from '@inertiajs/react';
import { CheckIcon, ArrowRightIcon, XMarkIcon } from '@/Components/Icons';

const getFeature = (plan, name) => plan.features.find((feature) => feature.name === name);

export default function Pricing({ plans = [] }) {
    const activePlans = plans ?? [];

    const featureNames = [];
    activePlans.forEach((plan) => {
        plan.features.forEach((feature) => {
            if (!featureNames.includes(feature.name)) {
                featureNames.push(feature.name);
            }
        });
    });

    const popularIndex = activePlans.length > 1 ? 1 : 0;

    const renderValue = (feature, iconClass = 'h-5 w-5 mx-auto') => {
        if (!feature) return <span className="text-gray-400">—</span>;

        if (typeof feature.value === 'boolean') {
            return feature.value ? (
                <CheckIcon className={`${iconClass} text-green-500`} />
            ) : (
                <XMarkIcon className={`${iconClass} text-gray-300`} />
            );
        }

        return <span className="text-sm font-medium text-gray-900">{feature.value}</span>;
    };

    return (
        <>
            <Head title="Tarifs - TASHO" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-tasho-dark to-tasho-primary/20 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-lg shadow-black/20">
                        <img src="/Images/logo.png" alt="TASHO" className="h-12 w-12 object-contain" />
                        <span className="text-xl font-black tracking-[0.14em] text-slate-900">TASHO</span>
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white">
                        Des tarifs <span className="text-tasho-primary">transparents</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                        Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent un essai gratuit de 14 jours.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {activePlans.length === 0 ? (
                        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">Les offres arrivent bientôt</h2>
                            <p className="mt-2 text-gray-500">
                                Aucun plan n'est disponible pour le moment. Revenez très prochainement.
                            </p>
                            <Link
                                href={route('register')}
                                className="mt-6 inline-flex items-center rounded-lg bg-tasho-primary px-6 py-2 font-medium text-white transition hover:bg-tasho-primary/90"
                            >
                                Créer un compte
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {activePlans.map((plan, index) => {
                                    const popular = index === popularIndex;

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition relative ${
                                                popular ? 'ring-2 ring-tasho-primary shadow-tasho-primary/10' : ''
                                            }`}
                                        >
                                            {popular && (
                                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-tasho-primary text-white text-xs font-semibold rounded-full">
                                                    Recommandé
                                                </span>
                                            )}
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {plan.description || 'Pour vos besoins créatifs'}
                                                </p>
                                                <div className="mt-4">
                                                    <span className="text-4xl font-bold text-gray-900">
                                                        {plan.is_free ? 'Gratuit' : plan.price_monthly_formatted}
                                                    </span>
                                                    {!plan.is_free && (
                                                        <span className="text-gray-500">/mois</span>
                                                    )}
                                                </div>
                                            </div>

                                            <ul className="mt-6 space-y-3">
                                                {plan.features.map((feature, fIndex) => (
                                                    <li key={fIndex} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">{feature.name}</span>
                                                        {typeof feature.value === 'boolean' ? (
                                                            feature.value ? (
                                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XMarkIcon className="h-4 w-4 text-gray-300" />
                                                            )
                                                        ) : (
                                                            <span className="font-medium text-gray-900">{feature.value}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-6">
                                                <Link
                                                    href={route('register')}
                                                    className={`block text-center px-4 py-2 rounded-lg font-semibold transition ${
                                                        popular
                                                            ? 'bg-tasho-primary text-white hover:bg-tasho-primary/90'
                                                            : plan.is_free
                                                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                            : 'bg-white border-2 border-tasho-primary text-tasho-primary hover:bg-tasho-primary/5'
                                                    }`}
                                                >
                                                    {plan.is_free ? 'Commencer' : 'Choisir ce plan'}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Comparison Table */}
                            <div className="mt-16 bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">Comparaison détaillée</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fonctionnalité</th>
                                                {activePlans.map((plan) => (
                                                    <th key={plan.id} className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                                        {plan.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {featureNames.map((feature, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3 text-sm text-gray-600">{feature}</td>
                                                    {activePlans.map((plan) => (
                                                        <td key={`${plan.id}-${feature}`} className="px-6 py-3 text-center">
                                                            {renderValue(getFeature(plan, feature))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* FAQ */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                            Questions fréquentes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900">Puis-je changer de plan ?</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Oui, vous pouvez changer de plan à tout moment. La différence sera calculée au prorata.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900">Y a-t-il un engagement ?</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Non, vous pouvez annuler votre abonnement à tout moment. Pas de frais de résiliation.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900">Que devient mon stockage si je résilie ?</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Vous aurez 30 jours pour récupérer vos données avant qu'elles ne soient supprimées.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900">Proposez-vous des réductions pour les équipes ?</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Oui, contactez-nous pour des tarifs personnalisés pour les grandes équipes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-tasho-primary/10 to-tasho-primary/5 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Vous avez des questions ?
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Notre équipe est là pour vous aider à choisir le bon plan.
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="#contact"
                                    className="inline-flex items-center px-6 py-2 bg-tasho-primary text-white rounded-lg font-medium hover:bg-tasho-primary/90 transition"
                                >
                                    Nous contacter
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
