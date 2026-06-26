import { Head, Link } from '@inertiajs/react';
import {
    CloudArrowUpIcon,
    FolderIcon,
    UserGroupIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    PhotoIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
    ArrowRightIcon,
    CheckIcon,
    LockClosedIcon,
    UsersIcon,
    SparklesIcon,
    ClockIcon,
    ShareIcon,
    EyeIcon,
    ArrowDownTrayIcon,
} from '@/Components/Icons';

export default function Features() {
    const features = [
        {
            icon: CloudArrowUpIcon,
            title: 'Stockage Sécurisé',
            description: 'Centralisez tous vos fichiers multimédias dans un espace sécurisé avec une architecture robuste.',
            details: [
                'Support de tous les formats (images, vidéos, documents)',
                'Stockage chiffré avec sauvegarde automatique',
                'Accès depuis n\'importe quel appareil',
            ],
        },
        {
            icon: FolderIcon,
            title: 'Organisation Intelligente',
            description: 'Structurez vos projets comme vous le souhaitez avec une hiérarchie de dossiers flexible.',
            details: [
                'Projets, sous-projets et dossiers illimités',
                'Arborescence personnalisable',
                'Recherche avancée par nom, type, date',
            ],
        },
        {
            icon: UserGroupIcon,
            title: 'Collaboration en Équipe',
            description: 'Travaillez ensemble efficacement avec des outils de collaboration puissants.',
            details: [
                'Invitation de membres avec rôles personnalisés',
                'Commentaires et discussions sur les fichiers',
                'Suivi des activités en temps réel',
            ],
        },
        {
            icon: GlobeAltIcon,
            title: 'Partage Client Professionnel',
            description: 'Partagez vos projets avec vos clients de manière sécurisée et professionnelle.',
            details: [
                'Galerie publique ou privée avec mot de passe',
                'Téléchargement contrôlé',
                'Statistiques de visualisation',
            ],
        },
        {
            icon: ShieldCheckIcon,
            title: 'Sécurité Avancée',
            description: 'Contrôlez précisément qui peut voir, modifier ou partager vos fichiers.',
            details: [
                'Permissions granulaires par projet',
                'Authentification sécurisée',
                'Journal d\'audit complet',
            ],
        },
        {
            icon: ChartBarIcon,
            title: 'Analyses et Suivi',
            description: 'Suivez l\'activité de votre équipe et de vos clients avec des statistiques détaillées.',
            details: [
                'Tableau de bord personnalisé',
                'Export des données d\'activité',
                'Rapports de performance',
            ],
        },
    ];

    return (
        <>
            <Head title="Fonctionnalités - TASHO" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-tasho-dark to-tasho-primary/20 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white">
                        Toutes les fonctionnalités
                        <br />
                        <span className="text-tasho-primary">pour les créatifs</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                        Découvrez pourquoi TASHO est la plateforme préférée des professionnels des médias
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-16">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            const isEven = index % 2 === 0;
                            return (
                                <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                                    <div className={`flex-1 ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                                        <div className="inline-flex h-12 w-12 rounded-lg bg-tasho-primary/10 items-center justify-center mb-4">
                                            <IconComponent className="h-6 w-6 text-tasho-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">{feature.title}</h2>
                                        <p className="mt-2 text-lg text-gray-500">{feature.description}</p>
                                        <ul className="mt-4 space-y-2">
                                            {feature.details.map((detail, dIndex) => (
                                                <li key={dIndex} className="flex items-center text-gray-600">
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
                                            <div className="text-center">
                                                <IconComponent className="h-24 w-24 text-tasho-primary/30 mx-auto" />
                                                <p className="mt-2 text-sm text-gray-400">Illustration de la fonctionnalité</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-tasho-primary/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Prêt à essayer toutes ces fonctionnalités ?
                    </h2>
                    <div className="mt-6">
                        <Link
                            href={route('register')}
                            className="inline-flex items-center px-6 py-3 bg-tasho-primary text-white rounded-lg font-semibold hover:bg-tasho-primary/90 transition"
                        >
                            Commencer l'essai gratuit
                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}