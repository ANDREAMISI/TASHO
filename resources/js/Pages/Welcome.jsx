import { Head, Link } from '@inertiajs/react';
import {
    CloudArrowUpIcon,
    FolderIcon,
    UserGroupIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    CheckIcon,
    PlayIcon,
    PhotoIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    LockClosedIcon,
    UsersIcon,
    SparklesIcon,
} from '@/Components/Icons';

export default function Welcome({ canLogin, canRegister }) {
    const features = [
        {
            icon: CloudArrowUpIcon,
            title: 'Stockage Sécurisé',
            description: 'Tous vos fichiers multimédias centralisés dans un espace sécurisé, accessible partout.',
            color: 'bg-blue-500',
        },
        {
            icon: FolderIcon,
            title: 'Organisation Intelligente',
            description: 'Projets, dossiers et fichiers organisés comme vous le souhaitez.',
            color: 'bg-purple-500',
        },
        {
            icon: UserGroupIcon,
            title: 'Collaboration en Équipe',
            description: 'Travaillez ensemble avec vos collaborateurs en temps réel.',
            color: 'bg-green-500',
        },
        {
            icon: ChartBarIcon,
            title: 'Suivi d\'Activité',
            description: 'Audit complet de toutes les actions pour un contrôle total.',
            color: 'bg-orange-500',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Sécurité Avancée',
            description: 'Permissions granulaires et partage sécurisé avec vos clients.',
            color: 'bg-red-500',
        },
        {
            icon: GlobeAltIcon,
            title: 'Partage Client',
            description: 'Galerie publique ou privée pour partager vos projets avec vos clients.',
            color: 'bg-teal-500',
        },
    ];

    const stats = [
        { value: '50K+', label: 'Utilisateurs actifs' },
        { value: '10M+', label: 'Fichiers gérés' },
        { value: '99.9%', label: 'Taux de disponibilité' },
        { value: '4.9/5', label: 'Note moyenne' },
    ];

    const testimonials = [
        {
            name: 'Sarah Martin',
            role: 'Photographe',
            content: 'TASHO a révolutionné ma façon de gérer mes projets photo. Plus jamais de fichiers perdus !',
            avatar: 'SM',
        },
        {
            name: 'Thomas Dubois',
            role: 'Studio Vidéo',
            content: 'La collaboration avec mon équipe n\'a jamais été aussi fluide. Indispensable !',
            avatar: 'TD',
        },
        {
            name: 'Marie Lambert',
            role: 'Agence Créative',
            content: 'Mes clients adorent la galerie de partage. Professionnel et sécurisé.',
            avatar: 'ML',
        },
    ];

    const plans = [
        {
            name: 'Free',
            price: '0',
            description: 'Pour commencer',
            features: [
                '1GB de stockage',
                '1 membre',
                '3 projets',
                'Partage basique',
            ],
            buttonText: 'Commencer',
            buttonColor: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
            popular: false,
        },
        {
            name: 'Starter',
            price: '19',
            description: 'Pour les freelances',
            features: [
                '10GB de stockage',
                '3 membres',
                'Projets illimités',
                'Partage client',
                'Commentaires',
            ],
            buttonText: 'Essayer',
            buttonColor: 'bg-tasho-primary text-white hover:bg-tasho-primary/90',
            popular: true,
        },
        {
            name: 'Pro',
            price: '49',
            description: 'Pour les studios',
            features: [
                '500GB de stockage',
                '15 membres',
                'Projets illimités',
                'Permissions avancées',
                'Audit complet',
                'Support prioritaire',
            ],
            buttonText: 'Essayer',
            buttonColor: 'bg-tasho-dark text-white hover:bg-gray-800',
            popular: false,
        },
        {
            name: 'Studio',
            price: '99',
            description: 'Pour les agences',
            features: [
                '1TB de stockage',
                'Membres illimités',
                'Projets illimités',
                'API personnalisée',
                'Branding personnalisé',
                'Support dédié',
            ],
            buttonText: 'Contacter',
            buttonColor: 'bg-white border-2 border-tasho-primary text-tasho-primary hover:bg-tasho-primary/5',
            popular: false,
        },
    ];

    return (
        <>
            <Head title="TASHO - La plateforme créative pour les professionnels des médias" />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-tasho-dark via-tasho-dark/95 to-tasho-primary/20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-tasho-primary rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tasho-primary/20 text-tasho-primary border border-tasho-primary/30">
                                <SparklesIcon className="h-4 w-4 mr-1" />
                                Nouvelle version
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                            The creative studio
                            <br />
                            <span className="text-tasho-primary">cloud platform.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                            Store, organize, review, and deliver your media — all from one secure workspace
                            built for photographers, videographers, and film studios.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={canRegister ? route('register') : route('login')}
                                className="inline-flex items-center px-6 py-3 bg-tasho-primary text-white rounded-lg font-semibold hover:bg-tasho-primary/90 transition text-lg"
                            >
                                Start for free
                                <ArrowRightIcon className="h-5 w-5 ml-2" />
                            </Link>
                            <button className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition text-lg backdrop-blur-sm">
                                <PlayIcon className="h-5 w-5 mr-2" />
                                Watch demo
                            </button>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">
                            Free 14-day trial · No credit card required · Cancel anytime
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                            Des outils puissants pour gérer vos projets créatifs de A à Z
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
                                    <div className={`h-12 w-12 rounded-lg ${feature.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Comment ça fonctionne
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                            En quelques étapes, transformez votre façon de travailler
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-tasho-primary">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Créez votre espace
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Inscrivez-vous et créez votre équipe en quelques clics
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-tasho-primary">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Organisez vos projets
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Créez des projets, des dossiers et importez vos fichiers
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-tasho-primary/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-tasho-primary">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Collaborez et partagez
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Invitez votre équipe et partagez avec vos clients
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Ils nous font confiance
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                            Découvrez ce que les professionnels des médias pensent de TASHO
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition">
                                <div className="flex items-center mb-4">
                                    <div className="h-12 w-12 rounded-full bg-tasho-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-semibold text-tasho-primary">
                                            {testimonial.avatar}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-gray-50" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Choisissez votre plan
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                            Des solutions adaptées à tous les besoins
                        </p>
                    </div>

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
                                        Le plus populaire
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
                                        <li key={fIndex} className="flex items-center text-sm text-gray-600">
                                            <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6">
                                    <Link
                                        href={canRegister ? route('register') : route('login')}
                                        className={`block text-center px-4 py-2 rounded-lg font-semibold transition ${plan.buttonColor}`}
                                    >
                                        {plan.buttonText}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-tasho-dark to-tasho-primary/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">
                        Prêt à transformer votre façon de travailler ?
                    </h2>
                    <p className="mt-4 text-xl text-gray-200">
                        Rejoignez des milliers de professionnels qui font confiance à TASHO
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={canRegister ? route('register') : route('login')}
                            className="inline-flex items-center px-8 py-3 bg-white text-tasho-dark rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
                        >
                            Commencer gratuitement
                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Link>
                        <Link
                            href={route('features')}
                            className="inline-flex items-center px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition text-lg backdrop-blur-sm"
                        >
                            En savoir plus
                        </Link>
                    </div>
                    <p className="mt-4 text-sm text-gray-300">
                        Essai gratuit de 14 jours · Sans carte de crédit · Annulation à tout moment
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-tasho-dark text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white font-bold text-xl mb-4">TASHO</h3>
                            <p className="text-sm text-gray-400">
                                La plateforme créative pour les professionnels des médias.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Produit</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href={route('features')} className="hover:text-white transition">Fonctionnalités</Link></li>
                                <li><Link href={route('pricing')} className="hover:text-white transition">Tarifs</Link></li>
                                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Entreprise</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">À propos</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Légal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                                <li><a href="#" className="hover:text-white transition">CGU</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} TASHO. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </>
    );
}