import { Head, Link } from '@inertiajs/react';
import { CheckIcon, ArrowRightIcon, XMarkIcon } from '@/Components/Icons';

export default function Pricing() {
    const plans = [
        {
            name: 'Free',
            price: '0',
            description: 'Pour commencer',
            features: [
                { name: 'Stockage', value: '1GB' },
                { name: 'Membres', value: '1' },
                { name: 'Projets', value: '3' },
                { name: 'Partage client', value: false },
                { name: 'Commentaires', value: false },
                { name: 'Audit complet', value: false },
                { name: 'Support', value: 'Communauté' },
            ],
            buttonText: 'Commencer',
            popular: false,
            priceId: 'free',
        },
        {
            name: 'Starter',
            price: '19',
            description: 'Pour les freelances',
            features: [
                { name: 'Stockage', value: '10GB' },
                { name: 'Membres', value: '3' },
                { name: 'Projets', value: 'Illimité' },
                { name: 'Partage client', value: true },
                { name: 'Commentaires', value: true },
                { name: 'Audit complet', value: false },
                { name: 'Support', value: 'Email' },
            ],
            buttonText: 'Essayer',
            popular: true,
            priceId: 'starter',
        },
        {
            name: 'Pro',
            price: '49',
            description: 'Pour les studios',
            features: [
                { name: 'Stockage', value: '500GB' },
                { name: 'Membres', value: '15' },
                { name: 'Projets', value: 'Illimité' },
                { name: 'Partage client', value: true },
                { name: 'Commentaires', value: true },
                { name: 'Audit complet', value: true },
                { name: 'Support', value: 'Prioritaire' },
            ],
            buttonText: 'Essayer',
            popular: false,
            priceId: 'pro',
        },
        {
            name: 'Studio',
            price: '99',
            description: 'Pour les agences',
            features: [
                { name: 'Stockage', value: '1TB' },
                { name: 'Membres', value: 'Illimité' },
                { name: 'Projets', value: 'Illimité' },
                { name: 'Partage client', value: true },
                { name: 'Commentaires', value: true },
                { name: 'Audit complet', value: true },
                { name: 'Support', value: 'Dédié' },
            ],
            buttonText: 'Contacter',
            popular: false,
            priceId: 'studio',
        },
    ];

    const featureNames = ['Stockage', 'Membres', 'Projets', 'Partage client', 'Commentaires', 'Audit complet', 'Support'];

    return (
        <>
            <Head title="Tarifs - TASHO" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-tasho-dark to-tasho-primary/20 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition relative ${
                                    plan.popular ? 'ring-2 ring-tasho-primary shadow-tasho-primary/10' : ''
                                }`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-tasho-primary text-white text-xs font-semibold rounded-full">
                                        Recommandé
                                    </span>
                                )}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                        <span className="text-gray-500">/mois</span>
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
                                            plan.popular
                                                ? 'bg-tasho-primary text-white hover:bg-tasho-primary/90'
                                                : plan.priceId === 'studio'
                                                ? 'bg-white border-2 border-tasho-primary text-tasho-primary hover:bg-tasho-primary/5'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        {plan.buttonText}
                                    </Link>
                                </div>
                            </div>
                        ))}
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
                                        {plans.map((plan) => (
                                            <th key={plan.name} className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {featureNames.map((feature, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm text-gray-600">{feature}</td>
                                            {plans.map((plan) => (
                                                <td key={plan.name + feature} className="px-6 py-3 text-center">
                                                    {(() => {
                                                        const f = plan.features.find(f => f.name === feature);
                                                        if (!f) return <span className="text-gray-400">—</span>;
                                                        if (typeof f.value === 'boolean') {
                                                            return f.value ? (
                                                                <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                                            ) : (
                                                                <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                                                            );
                                                        }
                                                        return <span className="text-sm font-medium text-gray-900">{f.value}</span>;
                                                    })()}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

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