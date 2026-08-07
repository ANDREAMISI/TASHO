import { useState } from 'react';
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
    GlobeAltIcon,
    LockClosedIcon,
    DocumentTextIcon,
} from '@/Components/Icons';

export default function Welcome({ canLogin, canRegister }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: CloudArrowUpIcon,
            title: 'Stockage cloud intelligent',
            description: 'Stockez et organisez vos fichiers de manière sécurisée et accessible depuis n\'importe où.',
        },
        {
            icon: ChartBarIcon,
            title: 'Révision rapide et précise',
            description: 'Centralisez les retours de vos clients avec des annotations précises et un contrôle de version.',
        },
        {
            icon: UserGroupIcon,
            title: 'Collaboration en studio',
            description: 'Travaillez en temps réel avec vos équipes créatives, des éditeurs aux producteurs.',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Galeries clients sécurisées',
            description: 'Partagez des galeries privées protégées par mot de passe et à accès limité dans le temps.',
        },
        {
            icon: GlobeAltIcon,
            title: 'Livraison instantanée',
            description: 'Livrez vos fichiers finaux dans n\'importe quel format avec compression automatique.',
        },
        {
            icon: LockClosedIcon,
            title: 'Flux proxy pour gros fichiers',
            description: 'Optimisez les fichiers 4K/8K avec des flux de travail proxy pour un partage et une révision plus rapides.',
        },
    ];

    return (
        <>
            <Head title="Tasho - La plateforme cloud pour studios créatifs" />

            <div className="min-h-screen bg-[#edf3ff] text-slate-900">
                {/* NAVBAR */}
                <nav className="relative text-white">
                    <div className="absolute inset-0 bg-[url(/Images/bg-total.png)] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,16,31,0.95),rgba(3,16,31,0.75))]" />
                    <div className="relative mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 lg:px-10">
                        
                        <div className="flex items-center gap-1.5">
                            <img src="/Images/logo.png" alt="Tasho logo" className="h-9 w-auto object-contain" />
                            <span className="text-lg font-black tracking-[0.08em] text-white">TASHO</span>
                        </div>

                        <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
                            <Link href="#" className="transition hover:text-white">Accueil</Link>
                            <Link href="#" className="transition hover:text-white">Fonctionnalités</Link>
                            <Link href="#pricing" className="transition hover:text-white">Tarifs</Link>
                            <Link href="#" className="transition hover:text-white">À propos</Link>
                            <Link href="#" className="transition hover:text-white">Témoignages</Link>
                        </div>

                        <div className="hidden items-center gap-4 md:flex">
                            <Link href={route('login')} className="text-sm font-medium text-slate-200 transition hover:text-white">
                                Se connecter
                            </Link>
                            <Link
                                href={canRegister ? route('register') : route('login')}
                                className="inline-flex items-center justify-center rounded-full bg-[#1469FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,104,255,0.45)] transition hover:bg-[#155ae8]"
                            >
                                Commencer gratuitement
                            </Link>
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="rounded-full border border-white/10 p-2 text-white md:hidden"
                        >
                            ☰
                        </button>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="border-b border-slate-200 bg-white md:hidden">
                        <div className="space-y-2 p-4 text-sm font-medium text-slate-700">
                            <Link href="#" className="block py-2">Accueil</Link>
                            <Link href="#" className="block py-2">Fonctionnalités</Link>
                            <Link href="#pricing" className="block py-2">Tarifs</Link>
                            <Link href="#" className="block py-2">À propos</Link>
                            <Link href="#" className="block py-2">Témoignages</Link>
                        </div>
                    </div>
                )}

                {/* HERO SECTION - AVEC hero1.png COMME BACKGROUND */}
                <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-[url(/Images/hero1.png)] bg-cover bg-center">
                    {/* Overlay sombre pour la lisibilité du texte */}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,16,31,0.7),rgba(3,16,31,0.85))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
                    
                    <div className="relative mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
                        <div className="mx-auto max-w-5xl text-center">
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-300/50 bg-[#2a76ff]/10 px-4 py-2 text-xs font-medium text-blue-100 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-blue-300" />
                                Nouveau — La révision client image par image est maintenant disponible
                                <ArrowRightIcon className="h-3 w-3" />
                            </div>

                            <h1 className="mx-auto max-w-[780px] text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-[62px] lg:leading-[1.05]">
                                Tasho, la plateforme cloud
                                <span className="block text-[#72c0ff]">pour studios créatifs.</span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-[640px] text-base text-slate-200 lg:text-[18px]">
                                Stockez, organisez, révisez et livrez vos médias — tout depuis un espace de travail sécurisé conçu pour photographes, vidéastes et studios de production.
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={canRegister ? route('register') : route('login')}
                                    className="inline-flex items-center justify-center rounded-xl bg-[#1d6eff] px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_28px_rgba(29,110,255,0.45)] transition hover:bg-[#175fe6]"
                                >
                                    Commencer gratuitement
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                                <Link
                                    href="#"
                                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                                >
                                    <PlayIcon className="mr-2 h-4 w-4" />
                                    Voir la démo
                                </Link>
                            </div>

                            <p className="mt-4 text-sm text-slate-300">
                                Essai gratuit de 7 jours · Aucune carte de crédit requise · Annulez à tout moment
                            </p>
                        </div>

                        {/* Éléments flottants décoratifs */}
                        <div className="relative mt-12 h-[150px] lg:mt-16 lg:h-[200px]">
                            <div className="absolute left-0 top-2 rounded-2xl bg-white/90 backdrop-blur-sm px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                        <CloudArrowUpIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-bold text-slate-900">342 fichiers synchronisés</div>
                                        <div className="text-[10px] text-slate-500">Aujourd'hui</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-0 right-8">
                                <div className="relative h-[170px] w-[240px]">
                                    <div className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center justify-center rounded-[28px] border border-cyan-300/70 bg-[#061b2f]/70 p-4 shadow-[0_0_30px_rgba(56,189,248,0.45)] backdrop-blur-md">
                                        <CloudArrowUpIcon className="h-10 w-10 text-cyan-300" />
                                    </div>
                                    <div className="absolute right-0 top-3 rounded-xl border border-cyan-300/50 bg-[#061b2f]/70 p-2.5 shadow-[0_0_18px_rgba(56,189,248,0.25)]">
                                        <FolderIcon className="h-5 w-5 text-cyan-300" />
                                    </div>
                                    <div className="absolute bottom-10 right-3 rounded-xl border border-cyan-300/50 bg-[#061b2f]/70 p-2.5 shadow-[0_0_18px_rgba(56,189,248,0.25)]">
                                        <DocumentTextIcon className="h-5 w-5 text-cyan-300" />
                                    </div>
                                    <div className="absolute bottom-6 left-4 rounded-xl border border-cyan-300/50 bg-[#061b2f]/70 p-2.5 shadow-[0_0_18px_rgba(56,189,248,0.25)]">
                                        <PlayIcon className="h-5 w-5 text-cyan-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-10">
                    <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-10">
                        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ils nous font confiance</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-lg font-bold text-slate-500 opacity-70 sm:gap-10 lg:gap-16">
                            <span>Studio Lightcraft</span>
                            <span>Visionary Films</span>
                            <span>Robotics Studio</span>
                            <span>FrameWerk</span>
                            <span>Lumière Production</span>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-20">
                    <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                        <div className="mx-auto mb-12 max-w-3xl text-center">
                            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
                                Conçu pour les <span className="text-blue-600">professionnels créatifs</span>.
                            </h2>
                            <p className="mt-4 text-base text-slate-500 lg:text-lg">
                                Chaque fonctionnalité est conçue pour les photographes, vidéastes et studios créatifs afin d'optimiser votre flux de travail.
                            </p>
                        </div>

                        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex gap-4 rounded-2xl p-3 transition hover:bg-slate-50">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden py-20 text-white bg-[url(/Images/bg-total.png)] bg-cover bg-center">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,16,31,0.92),rgba(3,16,31,0.78))]" />
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 18% 30%, rgba(59,130,246,0.45), transparent 24%), linear-gradient(135deg, rgba(14,67,118,0.2), transparent 55%)' }} />
                    <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
                        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">PERFORMANCE &amp; FLUX</p>
                                <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                                    Une plateforme.<span className="mt-2 block text-blue-400">Flux de travail infini.</span>
                                </h2>
                                <p className="mt-5 max-w-md text-base text-slate-300 lg:text-lg">
                                    De la capture à la livraison, centralisez l'ensemble de votre processus créatif en un seul endroit. Collaborez, révisez et partagez plus rapidement que jamais.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {[
                                        ['Stockage', CloudArrowUpIcon],
                                        ['Collaboration', UserGroupIcon],
                                        ['Livraison', GlobeAltIcon],
                                    ].map(([label, Icon]) => (
                                        <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                                                <Icon className="h-4 w-4 text-blue-300" />
                                            </div>
                                            <span className="text-sm font-medium text-white">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-white/10 bg-[#122847] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Bonjour, Admin 👋</h3>
                                        <p className="text-xs text-slate-400">Voici un aperçu de votre activité</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">A</div>
                                </div>

                                <div className="mb-6 grid grid-cols-4 gap-3">
                                    {[
                                        ['Fichiers', '2,1k'],
                                        ['Projets', '24k'],
                                        ['Partagés', '18'],
                                        ['Validés', '96'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
                                            <div className="mt-2 text-xl font-bold text-white">{value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
                                            <span>Utilisation du stockage</span>
                                            <span className="text-blue-300">2.34 TB</span>
                                        </div>
                                        <div className="flex h-28 items-end gap-2">
                                            {[42, 61, 54, 82, 71, 94, 88].map((height, index) => (
                                                <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white/5 p-4">
                                        <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
                                            <span>Activité</span>
                                            <span className="text-blue-300">24 / jour</span>
                                        </div>
                                        <div className="space-y-3">
                                            {[20, 40, 60, 75, 85, 55].map((value, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <span className="w-6 text-[10px] text-slate-400">P{index + 1}</span>
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="bg-[#edf3ff] py-20">
                    <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-10">
                        <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
                            Tarifs simples et <span className="text-blue-600">transparents.</span>
                        </h2>
                        <p className="mt-3 text-base text-slate-500 lg:text-lg">Commencez gratuitement. Évoluez selon vos besoins.</p>

                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {[
                                {
                                    name: 'Découverte',
                                    price: '$19',
                                    desc: 'Parfait pour commencer',
                                    features: ['5 projets actifs', '100 Go de stockage', 'Galeries clients basiques', 'Support standard'],
                                    button: 'Commencer l\'essai gratuit',
                                    highlight: false,
                                },
                                {
                                    name: 'Studio Pro',
                                    price: '$59',
                                    desc: 'Le package idéal pour les pros',
                                    features: ['Projets illimités', '10 To de stockage', 'Livraison client prioritaire', 'Support prioritaire'],
                                    button: 'Commencer l\'essai gratuit',
                                    highlight: true,
                                },
                                {
                                    name: 'Entreprise',
                                    price: '$149',
                                    desc: 'Pour les grandes équipes',
                                    features: ['Tout le plan Studio Pro', 'Limites personnalisables', 'API & SSO', 'Support dédié 24/7'],
                                    button: 'Contacter les ventes',
                                    highlight: false,
                                },
                            ].map((plan, index) => (
                                <div
                                    key={index}
                                    className={`rounded-[28px] border p-6 text-left shadow-sm ${
                                        plan.highlight
                                            ? 'border-[#1d6bf1] bg-[#071a2d] text-white shadow-[0_25px_50px_rgba(14,65,128,0.25)]'
                                            : 'border-slate-200 bg-white text-slate-900'
                                    }`}
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                                        {plan.highlight && (
                                            <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Populaire</span>
                                        )}
                                    </div>

                                    <div className="mb-6 flex items-end gap-2">
                                        <span className="text-4xl font-black tracking-[-0.06em]">{plan.price}</span>
                                        <span className={`${plan.highlight ? 'text-slate-300' : 'text-slate-500'} text-sm`}>/mois</span>
                                    </div>

                                    <p className={`mb-6 text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.desc}</p>

                                    <ul className="space-y-3 border-t border-slate-200/10 pt-6">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3 text-sm">
                                                <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${plan.highlight ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                                                    <CheckIcon className="h-3 w-3" />
                                                </span>
                                                <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                        {plan.button}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-white py-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))]" />
                    <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
                        <div className="mb-8 text-center text-sm font-medium text-slate-500">Ce que les photographes créatifs adorent.</div>
                        <div className="grid gap-4 text-center text-lg font-bold text-slate-500 sm:grid-cols-2 lg:grid-cols-5">
                            {['Studio Lightcraft', 'Visionary Films', 'Rebecca Studio', 'FrameWerk', 'Lumière Production'].map((brand) => (
                                <div key={brand} className="rounded-xl border border-slate-200 bg-white/70 py-4 text-base shadow-sm backdrop-blur-sm">{brand}</div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="relative overflow-hidden pb-8 pt-20 text-white bg-[url(/Images/bg-total.png)] bg-cover bg-center">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,26,45,0.88),rgba(3,26,45,0.96))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_70%)]" />
                    <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
                        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <h2 className="text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl">
                                Votre projet.<span className="block text-blue-400">Dans le cloud.</span>
                            </h2>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href={canRegister ? route('register') : route('login')} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
                                    Commencer gratuitement
                                </Link>
                                <Link href="#" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                    Contacter les ventes
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <div className="mb-6 flex items-center gap-3">
                                    <img src="/Images/logo.png" alt="Tasho logo" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15" />
                                    <span className="text-[28px] font-black tracking-[-0.08em]">TASHO</span>
                                </div>
                                <p className="max-w-xs text-sm leading-6 text-slate-300">
                                    La plateforme cloud pour gérer vos fichiers, livrer à vos clients et collaborer sans friction.
                                </p>
                            </div>

                            {[
                                ['Produit', ['Fonctionnalités', 'Tarifs', 'À propos', 'Intégrations']],
                                ['Entreprise', ['Blog', 'À propos', 'Carrières', 'Sécurité']],
                                ['Ressources', ['Centre d\'aide', 'Guides', 'Statut', 'Confidentialité']],
                            ].map(([title, items]) => (
                                <div key={title}>
                                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        {items.map((item) => (
                                            <li key={item}><a href="#" className="transition hover:text-white">{item}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                            <p>© 2024 Tasho. Tous droits réservés.</p>
                            <div className="flex flex-wrap gap-4">
                                <a href="#" className="hover:text-white">Politique de confidentialité</a>
                                <a href="#" className="hover:text-white">Conditions d\'utilisation</a>
                                <a href="#" className="hover:text-white">Paramètres des cookies</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}