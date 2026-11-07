import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CloudArrowUpIcon,
    ArrowRightIcon,
    CheckIcon,
    PlayIcon,
} from '@/Components/Icons';
import {
    Cta,
    Features,
    Platform,
    TashoSectionsStyles,
    Trust,
} from '@/Components/TashoSections';

const COPY = {
    fr: {
        nav: {
            home: 'Accueil',
            features: 'Fonctionnalités',
            pricing: 'Tarifs',
            about: 'À propos',
            testimonials: 'Témoignages',
            login: 'Se connecter',
            start: 'Commencer gratuitement',
            menu: 'Ouvrir le menu',
            theme: 'Changer de thème',
            language: 'Changer de langue',
        },
        hero: {
            title: 'Tasho, la plateforme cloud',
            titleAccent: 'pour studios créatifs.',
            subtitle:
                'Stockez, organisez, révisez et livrez vos médias — tout depuis un espace de travail sécurisé conçu pour photographes, vidéastes et studios de production.',
            start: 'Commencer gratuitement',
            demo: 'Voir la démo',
            note: 'Essai gratuit de 7 jours · Aucune carte de crédit requise · Annulez à tout moment',
            synced: '342 fichiers synchronisés',
            today: "Aujourd'hui",
        },
        pricing: {
            title: 'Tarifs simples et',
            titleAccent: 'transparents.',
            subtitle: 'Commencez gratuitement. Évoluez selon vos besoins.',
            month: '/mois',
            popular: 'Populaire',
            trial: "Commencer l'essai gratuit",
            sales: 'Contacter les ventes',
            plans: [
                {
                    name: 'Découverte',
                    price: '$19',
                    desc: 'Parfait pour commencer',
                    features: ['5 projets actifs', '100 Go de stockage', 'Galeries clients basiques', 'Support standard'],
                    highlight: false,
                },
                {
                    name: 'Studio Pro',
                    price: '$59',
                    desc: 'Le package idéal pour les pros',
                    features: ['Projets illimités', '10 To de stockage', 'Livraison client prioritaire', 'Support prioritaire'],
                    highlight: true,
                },
                {
                    name: 'Entreprise',
                    price: '$149',
                    desc: 'Pour les grandes équipes',
                    features: ['Tout le plan Studio Pro', 'Limites personnalisables', 'API & SSO', 'Support dédié 24/7'],
                    highlight: false,
                },
            ],
        },
        footer: {
            tagline: 'La plateforme cloud pour livrer vos médias et collaborer avec vos clients.',
            columns: [
                ['Produit', ['Fonctionnalités', 'Tarifs', 'Sécurité', 'Intégrations']],
                ['Entreprise', ['À propos', 'Blog', 'Carrières', 'Contact']],
                ['Ressources', ["Centre d'aide", 'Guides', 'API', 'Statut']],
            ],
            language: 'Langue',
            languageValue: 'Français',
            copyright: '© 2026 Tasho. Tous droits réservés.',
        },
    },
    en: {
        nav: {
            home: 'Home',
            features: 'Features',
            pricing: 'Pricing',
            about: 'About',
            testimonials: 'Testimonials',
            login: 'Sign in',
            start: 'Get started free',
            menu: 'Open menu',
            theme: 'Switch theme',
            language: 'Switch language',
        },
        hero: {
            title: 'Tasho, the cloud platform',
            titleAccent: 'for creative studios.',
            subtitle:
                'Store, organize, review and deliver your media — all from a secure workspace built for photographers, videographers and production studios.',
            start: 'Get started free',
            demo: 'Watch the demo',
            note: 'Free 7-day trial · No credit card required · Cancel anytime',
            synced: '342 files synced',
            today: 'Today',
        },
        pricing: {
            title: 'Simple and',
            titleAccent: 'transparent pricing.',
            subtitle: 'Start for free. Scale as you grow.',
            month: '/month',
            popular: 'Popular',
            trial: 'Start free trial',
            sales: 'Contact sales',
            plans: [
                {
                    name: 'Discovery',
                    price: '$19',
                    desc: 'Perfect to get started',
                    features: ['5 active projects', '100 GB storage', 'Basic client galleries', 'Standard support'],
                    highlight: false,
                },
                {
                    name: 'Studio Pro',
                    price: '$59',
                    desc: 'The ideal package for pros',
                    features: ['Unlimited projects', '10 TB storage', 'Priority client delivery', 'Priority support'],
                    highlight: true,
                },
                {
                    name: 'Enterprise',
                    price: '$149',
                    desc: 'For large teams',
                    features: ['Everything in Studio Pro', 'Custom limits', 'API & SSO', '24/7 dedicated support'],
                    highlight: false,
                },
            ],
        },
        footer: {
            tagline: 'The cloud platform to deliver your media and collaborate with your clients.',
            columns: [
                ['Product', ['Features', 'Pricing', 'Security', 'Integrations']],
                ['Company', ['About', 'Blog', 'Careers', 'Contact']],
                ['Resources', ['Help center', 'Guides', 'API', 'Status']],
            ],
            language: 'Language',
            languageValue: 'English',
            copyright: '© 2026 Tasho. All rights reserved.',
        },
    },
};

const getInitialTheme = () => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const saved = window.localStorage.getItem('tasho-theme');

    if (saved === 'light' || saved === 'dark') {
        return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialLang = () => {
    if (typeof window === 'undefined') {
        return 'fr';
    }

    return window.localStorage.getItem('tasho-lang') === 'en' ? 'en' : 'fr';
};

export default function Welcome({ canLogin, canRegister }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(getInitialTheme);
    const [lang, setLang] = useState(getInitialLang);
    const copy = COPY[lang];

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('tasho-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = lang;
        window.localStorage.setItem('tasho-lang', lang);
    }, [lang]);

    return (
        <>
            <Head title="Tasho - La plateforme cloud pour studios créatifs" />

            <div className="min-h-screen bg-[#edf3ff] text-slate-900 transition-colors dark:bg-[#060d20] dark:text-slate-100">
                <TashoSectionsStyles />

                {/* NAVBAR */}
                <nav className="landing-top lt-nav sticky top-0 z-50 border-b transition-colors">
                    <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-6 sm:h-20 lg:px-10">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <img
                                src="/Images/logo.png"
                                alt="Tasho"
                                className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
                            />
                            <span className="text-lg font-black tracking-[0.08em]" style={{ color: 'var(--lt-text)' }}>
                                TASHO
                            </span>
                        </Link>

                        <div className="hidden items-center gap-8 text-sm font-medium xl:flex">
                            <Link href="#" className="lt-nav-link">{copy.nav.home}</Link>
                            <Link href="#fonctions" className="lt-nav-link">{copy.nav.features}</Link>
                            <Link href="#pricing" className="lt-nav-link">{copy.nav.pricing}</Link>
                            <Link href="#" className="lt-nav-link">{copy.nav.about}</Link>
                            <Link href="#" className="lt-nav-link">{copy.nav.testimonials}</Link>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                aria-label={copy.nav.theme}
                                aria-pressed={theme === 'dark'}
                                title={copy.nav.theme}
                                className="lt-icon-btn inline-flex h-9 w-9 items-center justify-center rounded-full"
                            >
                                {theme === 'dark' ? (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                                    </svg>
                                )}
                            </button>

                            <div
                                role="group"
                                aria-label={copy.nav.language}
                                className="lt-lang inline-flex items-center rounded-full p-0.5 text-[11px] font-semibold"
                            >
                                {['fr', 'en'].map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => setLang(code)}
                                        aria-pressed={lang === code}
                                        className={`rounded-full px-2.5 py-1 uppercase transition ${
                                            lang === code ? 'lt-lang-active' : 'lt-lang-idle'
                                        }`}
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden items-center gap-4 xl:flex">
                                <Link href={route('login')} className="lt-nav-link text-sm font-medium">
                                    {copy.nav.login}
                                </Link>
                                <Link
                                    href={canRegister ? route('register') : route('login')}
                                    className="lt-cta inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
                                >
                                    {copy.nav.start}
                                </Link>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={copy.nav.menu}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-menu"
                                className="lt-icon-btn rounded-full p-2 xl:hidden"
                            >
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div id="mobile-menu" className="landing-top lt-mobile-menu xl:hidden">
                        <div className="space-y-1 px-6 py-4 text-sm font-medium">
                            <Link href="#" className="lt-nav-link block py-2.5">{copy.nav.home}</Link>
                            <Link href="#fonctions" className="lt-nav-link block py-2.5">{copy.nav.features}</Link>
                            <Link href="#pricing" className="lt-nav-link block py-2.5">{copy.nav.pricing}</Link>
                            <Link href="#" className="lt-nav-link block py-2.5">{copy.nav.about}</Link>
                            <Link href="#" className="lt-nav-link block py-2.5">{copy.nav.testimonials}</Link>
                            <Link href={route('login')} className="lt-nav-link block py-2.5">{copy.nav.login}</Link>
                            <Link
                                href={canRegister ? route('register') : route('login')}
                                className="lt-cta mt-3 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                            >
                                {copy.nav.start}
                            </Link>
                        </div>
                    </div>
                )}

                {/* HERO SECTION - photo hero1.png + illustration cloud */}
                <section
                    className="landing-top lt-hero relative isolate flex min-h-[88vh] items-center overflow-hidden"
                    style={{ backgroundColor: 'var(--lt-bg)' }}
                >
                    {/* Photo : WebP responsive, chargée en priorité, jamais lazy */}
                    <div className="absolute inset-0">
                        <picture>
                            <source
                                type="image/webp"
                                srcSet="/Images/hero1-480.webp 480w, /Images/hero1-768.webp 768w, /Images/hero1-1024.webp 1024w, /Images/hero1-1280.webp 1280w, /Images/hero1-1536.webp 1536w"
                                sizes="100vw"
                            />
                            <img
                                src="/Images/hero1.png"
                                alt=""
                                width={1536}
                                height={1024}
                                fetchpriority="high"
                                decoding="async"
                                className="lt-hero-photo h-full w-full object-cover"
                                style={{ filter: 'var(--lt-photo-filter)' }}
                            />
                        </picture>
                    </div>

                    {/* Voile de lisibilité (tokenisé : valeurs sombres = rendu historique) */}
                    <div className="lt-hero-overlay absolute inset-0" aria-hidden="true" />
                    <div className="lt-hero-glow absolute inset-0" aria-hidden="true" />
                    <div className="lt-hero-fade absolute inset-x-0 bottom-0 h-24 sm:h-32" aria-hidden="true" />

                    <div className="relative z-10 mx-auto grid w-full max-w-[1280px] items-center gap-10 px-6 pb-16 pt-14 sm:pt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-6 lg:px-10 lg:pb-24 lg:pt-20">
                        <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:max-w-[720px] lg:text-left">
                            <h1
                                className="mx-auto max-w-[720px] text-[clamp(2.15rem,6.2vw,3.5rem)] font-black leading-[1.06] tracking-[-0.05em] lg:mx-0"
                                style={{ color: 'var(--lt-text)' }}
                            >
                                {copy.hero.title}
                                <span className="lt-hero-accent block">{copy.hero.titleAccent}</span>
                            </h1>

                            <p
                                className="mx-auto mt-6 max-w-[60ch] text-base leading-relaxed sm:text-[17px] lg:mx-0 lg:text-[18px]"
                                style={{ color: 'var(--lt-muted)' }}
                            >
                                {copy.hero.subtitle}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                                <Link
                                    href={canRegister ? route('register') : route('login')}
                                    className="lt-btn lt-btn-primary group inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-7 text-base font-semibold sm:w-auto"
                                >
                                    {copy.hero.start}
                                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" />
                                </Link>
                                <Link
                                    href="#"
                                    className="lt-btn lt-btn-ghost inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-7 text-base font-semibold sm:w-auto"
                                >
                                    <PlayIcon className="h-4 w-4" />
                                    {copy.hero.demo}
                                </Link>
                            </div>

                            <ul
                                className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] sm:text-sm lg:justify-start"
                                style={{ color: 'var(--lt-muted-soft)' }}
                            >
                                {copy.hero.note.split(' · ').map((item) => (
                                    <li key={item} className="inline-flex items-center gap-1.5">
                                        <CheckIcon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--lt-primary)' }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Illustration : cloud + tuiles + carte, aria-hidden */}
                        <div
                            className="relative mx-auto h-[280px] w-full max-w-[340px] sm:h-[330px] sm:max-w-[400px] lg:h-[420px] lg:max-w-[420px]"
                            aria-hidden="true"
                        >
                            <span className="lt-ring lt-rise lt-rise-1 absolute inset-0 m-auto h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] lg:h-[340px] lg:w-[340px]" />
                            <span className="lt-ring lt-ring-2 lt-rise lt-rise-2 absolute inset-0 m-auto h-[290px] w-[290px] sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]" />

                            <div className="lt-card lt-rise lt-rise-3 absolute bottom-0 left-0 flex items-center gap-3 px-3.5 py-3 sm:left-2 sm:px-4">
                                <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                    style={{ background: 'var(--lt-primary-soft)', color: 'var(--lt-primary)' }}
                                >
                                    <CloudArrowUpIcon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate text-[12px] font-bold sm:text-[13px]" style={{ color: 'var(--lt-card-text)' }}>
                                        {copy.hero.synced}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px]" style={{ color: 'var(--lt-card-muted)' }}>
                                        {copy.hero.today}
                                    </div>
                                </div>
                                <span className="relative ml-1 flex h-2.5 w-2.5 shrink-0">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <Trust lang={lang} />

                <Features
                    lang={lang}
                    images={[
                        '/Images/camera1.png',
                        '/Images/camera2.png',
                        '/Images/camera4.png',
                        '/Images/camera5.png',
                    ]}
                />

                <Platform lang={lang} />

                <section id="pricing" className="bg-[#edf3ff] py-20 transition-colors dark:bg-[#081431]">
                    <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-10">
                        <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900 dark:text-white sm:text-4xl">
                            {copy.pricing.title}{' '}
                            <span className="text-blue-600 dark:text-blue-400">{copy.pricing.titleAccent}</span>
                        </h2>
                        <p className="mt-3 text-base text-slate-500 dark:text-slate-400 lg:text-lg">
                            {copy.pricing.subtitle}
                        </p>

                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {copy.pricing.plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`rounded-[28px] border p-6 text-left shadow-sm ${
                                        plan.highlight
                                            ? 'border-[#1d6bf1] bg-[#071a2d] text-white shadow-[0_25px_50px_rgba(14,65,128,0.25)]'
                                            : 'border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#0e1b3c] dark:text-white'
                                    }`}
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                                        {plan.highlight && (
                                            <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                                                {copy.pricing.popular}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6 flex items-end gap-2">
                                        <span className="text-4xl font-black tracking-[-0.06em]">{plan.price}</span>
                                        <span className={`${plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'} text-sm`}>
                                            {copy.pricing.month}
                                        </span>
                                    </div>

                                    <p className={`mb-6 text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {plan.desc}
                                    </p>

                                    <ul className="space-y-3 border-t border-slate-200/10 pt-6">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3 text-sm">
                                                <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${plan.highlight ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'}`}>
                                                    <CheckIcon className="h-3 w-3" />
                                                </span>
                                                <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            plan.highlight
                                                ? 'bg-blue-600 text-white hover:bg-blue-500'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500'
                                        }`}
                                    >
                                        {index === 2 ? copy.pricing.sales : copy.pricing.trial}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Cta lang={lang} />

                {/* FOOTER */}
                <footer className="relative overflow-hidden bg-[#030816] text-white">
                    <div className="relative mx-auto w-full max-w-[1208px] px-6">
                        {/* Colonnes de liens */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[323fr_242fr_242fr_242fr_111fr] lg:gap-0">
                            {/* Marque */}
                            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#1b83f4] text-[15px] font-bold leading-none text-white">
                                    T
                                </span>
                                <div className="mt-1 text-[13px] font-bold leading-none tracking-[0.12em] text-white">TASHO</div>
                                <p className="mt-5 max-w-[340px] text-[15px] leading-[22px] text-[#a1b7d5]">
                                    {copy.footer.tagline}
                                </p>
                            </div>

                            {copy.footer.columns.map(([title, items]) => (
                                <div key={title}>
                                    <h3 className="text-[15px] font-semibold leading-5 text-white">{title}</h3>
                                    <ul className="mt-4 space-y-3 text-[15px] leading-5 text-[#a1b7d5]">
                                        {items.map((item) => (
                                            <li key={item}>
                                                <a href="#" className="transition hover:text-white">{item}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Langue */}
                            <div>
                                <h3 className="text-[15px] font-semibold leading-5 text-white">{copy.footer.language}</h3>
                                <button
                                    type="button"
                                    onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                                    aria-label={copy.nav.language}
                                    className="mt-[26px] inline-flex items-center gap-3 text-[15px] leading-5 text-white transition hover:text-[#c9d7ea]"
                                >
                                    {copy.footer.languageValue}
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Copyright */}
                        <p className="pt-10 text-sm text-[#808eaa]">{copy.footer.copyright}</p>
                    </div>

                    {/* Signature géante */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none relative mt-9 h-[clamp(64px,15.9vw,225px)] select-none overflow-hidden"
                    >
                        <div
                            className="whitespace-nowrap text-center text-[clamp(88px,21.9vw,310px)] font-black leading-[0.73] tracking-[-0.08em]"
                            style={{ WebkitTextStroke: '2px #2e3e67', color: 'transparent' }}
                        >
                            TASHO
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}