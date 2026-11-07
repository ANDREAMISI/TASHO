import { useCallback, useEffect, useRef, useState } from 'react';

/* ═════════ Contenu FR / EN ═════════ */
const T = {
    fr: {
        trust: 'Ils nous font confiance',
        featLead: 'Conçu pour les ',
        featAccent: 'professionnels créatifs',
        featSub:
            "Chaque fonctionnalité est pensée pour les photographes, vidéastes et studios créatifs afin d'optimiser votre flux de travail.",
        feats: [
            { t: 'Stockage cloud intelligent', alt: 'Photographe classant ses fichiers dans un espace cloud' },
            { t: 'Révision rapide et précise', alt: "Monteur vidéo révisant un projet à l'écran" },
            { t: 'Collaboration en studio', alt: 'Équipe créative travaillant ensemble en studio' },
            { t: 'Galeries clients sécurisées', alt: 'Client consultant une galerie photo privée' },
        ],
        /* Cartes retirées de cette section, à remettre si besoin :
           { t: "Livraison instantanée" }, { t: "Flux proxy pour gros fichiers" } */
        perfTitle: 'Une plateforme. Flux de travail infini.',
        perfSub:
            "De la livraison à la collaboration, centralisez l'ensemble de votre processus créatif en un seul endroit.",
        perfLink: 'Voir les tarifs',
        perf: [
            {
                t: 'Stockage',
                d: 'Importez, classez et retrouvez tous vos médias sans jamais manquer d’espace.',
                chip: 'Stockage utilisé',
                chipS: '612 Go / 1 To',
            },
            {
                t: 'Collaboration',
                d: 'Révisez, commentez et validez avec votre équipe et vos clients, au même endroit.',
                chip: 'En ligne maintenant',
                chipS: '4 membres',
            },
            {
                t: 'Livraison',
                d: 'Partagez vos galeries et livrez les fichiers finaux en un clic.',
                chip: 'Livré à Lumière Production',
                chipS: "À l'instant",
            },
        ],
        hello: 'Bonjour, Admin',
        kpis: [
            ['2,1k', 'Fichiers'],
            ['24h', 'Livraison'],
            ['12', 'Projets'],
            ['96', 'Satisfaction'],
        ],
        usage: 'Utilisation du stockage',
        ctaTitle: 'Votre projet. Dans le cloud.',
        ctaSub: 'Rejoignez les studios qui livrent leurs médias plus vite, avec Tasho.',
        start: 'Commencer gratuitement',
        sales: 'Contacter les ventes',
        prev: 'Précédent',
        next: 'Suivant',
        card: 'Carte',
    },
    en: {
        trust: 'Trusted by',
        featLead: 'Built for ',
        featAccent: 'creative professionals',
        featSub:
            'Every feature is designed for photographers, videographers and creative studios to streamline your workflow.',
        feats: [
            { t: 'Smart cloud storage', alt: 'Photographer organizing files in a cloud workspace' },
            { t: 'Fast, precise review', alt: 'Video editor reviewing a project on screen' },
            { t: 'Studio collaboration', alt: 'Creative team working together in a studio' },
            { t: 'Secure client galleries', alt: 'Client browsing a private photo gallery' },
        ],
        perfTitle: 'One platform. Endless workflow.',
        perfSub:
            'From delivery to collaboration, centralize your whole creative process in one place.',
        perfLink: 'See pricing',
        perf: [
            {
                t: 'Storage',
                d: 'Import, organize and find all your media without ever running out of space.',
                chip: 'Storage used',
                chipS: '612 GB / 1 TB',
            },
            {
                t: 'Collaboration',
                d: 'Review, comment and approve with your team and clients, in one place.',
                chip: 'Online now',
                chipS: '4 members',
            },
            {
                t: 'Delivery',
                d: 'Share your galleries and deliver final files in one click.',
                chip: 'Delivered to Lumière Production',
                chipS: 'Just now',
            },
        ],
        hello: 'Hello, Admin',
        kpis: [
            ['2.1k', 'Files'],
            ['24h', 'Delivery'],
            ['12', 'Projects'],
            ['96', 'Satisfaction'],
        ],
        usage: 'Storage usage',
        ctaTitle: 'Your project. In the cloud.',
        ctaSub: 'Join the studios delivering their media faster with Tasho.',
        start: 'Get started free',
        sales: 'Contact sales',
        prev: 'Previous',
        next: 'Next',
        card: 'Card',
    },
};

const PARTNERS = ['Madia Lightcraft', 'Visionary Films', 'Rebelion Studio', 'FrameWork', 'Lumière Production'];

/* ═════════ Icônes (flèches, plateforme) ═════════ */
const P = {
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    left: 'm15 6-6 6 6 6',
    right: 'm9 6 6 6-6 6',
    cloud: 'M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9H7Z',
    users:
        'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 9v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
};

const Ic = ({ n, s = 20 }) => (
    <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d={P[n]} />
    </svg>
);

const PERF_ICONS = ['cloud', 'users', 'bolt'];

/* ═════════ Styles ═════════
   COULEURS : branchées sur les variables de l'app quand elles existent,
   avec une valeur de secours. Remplacer --app-* par les vrais noms si besoin. */
const CSS = `
.tsx{--bg:var(--app-background,#fff);--bg2:var(--app-muted,#f6f8fe);--surf:var(--app-card,#fff);--ink:var(--app-foreground,#0f1c45);
 --mut:var(--app-muted-foreground,#6a7599);--line:var(--app-border,#e3e9f6);--pri:var(--app-primary,#1f4bd8);--pri2:var(--app-primary-soft,#e8eeff);
 --on-pri:var(--app-primary-foreground,#fff);--dk:var(--app-dark-surface,#071436);--sh:0 24px 60px -30px rgba(15,28,69,.28);
 color:var(--ink);background:var(--bg);line-height:1.55;font-family:inherit}
.dark .tsx,.tsx[data-theme=dark]{--bg:var(--app-background,#060d20);--bg2:var(--app-muted,#091431);--surf:var(--app-card,#0e1b3c);--ink:var(--app-foreground,#eaf0ff);
 --mut:var(--app-muted-foreground,#93a3c7);--line:var(--app-border,#1b2c55);--pri:var(--app-primary,#4d84ff);--pri2:var(--app-primary-soft,#13275a);--sh:0 24px 60px -30px rgba(0,0,0,.8)}
.tsx *{box-sizing:border-box}.tsx a{color:inherit;text-decoration:none}.tsx button{font:inherit;cursor:pointer;color:inherit}
.tsx :focus-visible{outline:2px solid var(--pri);outline-offset:2px}
.tsx .wrap{max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
.tsx .sec{position:relative;padding:96px 0;background:var(--bg)}.tsx .sec.alt{background:var(--bg2)}
.tsx .sec::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;
 background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:72px 72px;
 -webkit-mask-image:linear-gradient(180deg,transparent,#000 25%,#000 70%,transparent);mask-image:linear-gradient(180deg,transparent,#000 25%,#000 70%,transparent)}
.tsx h2{font-size:clamp(1.9rem,3.6vw,2.7rem);line-height:1.12;letter-spacing:-.025em;margin:0;font-weight:800}
.tsx .sub{color:var(--mut);margin:12px 0 0;max-width:56ch}
.tsx .head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:44px;flex-wrap:wrap}.tsx .head.c{flex-direction:column;align-items:center;text-align:center}
.tsx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:11px 18px;font-weight:700;font-size:.9rem;border:1px solid transparent;transition:transform .15s,filter .2s,border-color .2s}
.tsx .btn:active{transform:scale(.97)}.tsx .btn.p{background:var(--pri);color:var(--on-pri)}.tsx .btn.p:hover{filter:brightness(1.1)}
.tsx .link{display:inline-flex;align-items:center;gap:10px;color:var(--pri);font-weight:700}
.tsx .link i{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--pri2);font-style:normal}
/* confiance (affichée une seule fois) */
.tsx .trust{padding:44px 0;text-align:center;background:var(--bg);border-bottom:1px solid var(--line)}
.tsx .trust small{display:block;color:var(--mut);font-weight:600;margin-bottom:18px}
.tsx .logos{display:flex;justify-content:center;gap:12px 40px;flex-wrap:wrap}.tsx .logos span{font-weight:800;color:var(--mut);opacity:.8;font-size:1.02rem}
/* fonctionnalités : 4 cartes, image nette, titre seul, aucun flou */
.tsx .rail{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 40px)/3);gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
.tsx .rail::-webkit-scrollbar{display:none}
.tsx .fc{scroll-snap-align:start;position:relative;min-height:420px;border-radius:22px;padding:26px;display:flex;align-items:flex-end;color:#fff;overflow:hidden;background:linear-gradient(160deg,var(--pri),var(--dk));box-shadow:var(--sh);isolation:isolate}
.tsx .fc img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.tsx .fc::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,rgba(4,10,30,.7) 0,rgba(4,10,30,0) 60%)}
.tsx .fc h3{margin:0;font-size:1.3rem;line-height:1.25;font-weight:800}
.tsx .ctl{display:flex;justify-content:space-between;align-items:center;margin-top:26px}
.tsx .dots{display:flex;gap:8px}.tsx .dots button{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:var(--line);transition:width .25s,background .25s}
.tsx .dots button.on{width:32px;background:var(--pri)}
.tsx .arrows{display:flex;gap:10px}.tsx .arrows button{width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:var(--surf);display:grid;place-items:center}
.tsx .arrows button:hover:not(:disabled){border-color:var(--pri);color:var(--pri)}.tsx .arrows button:disabled{opacity:.4;cursor:default}
/* plateforme : carrousel scindé 01 / 03 */
.tsx .perf{display:grid;grid-template-columns:1fr 1.15fr;gap:56px;align-items:center}
.tsx .count{font-weight:800;font-size:.85rem;color:var(--pri)}
.tsx .gi2{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--pri2);color:var(--pri);margin:14px 0}
.tsx .perf h3{font-size:2rem;margin:0 0 8px;font-weight:800;letter-spacing:-.02em}.tsx .perf p.d{color:var(--mut);margin:0 0 28px;max-width:40ch}
.tsx .viz{position:relative;border-radius:22px;background:linear-gradient(160deg,var(--pri),var(--dk) 70%);padding:70px 24px 24px;color:#eaf0ff;box-shadow:var(--sh);min-height:390px}
.tsx .viz .chip{position:absolute;left:20px;top:20px;display:flex;gap:10px;align-items:center;background:var(--surf);color:var(--ink);border-radius:12px;padding:9px 13px;box-shadow:var(--sh);font-size:.78rem}
.tsx .chip svg{color:var(--pri)}.tsx .chip em{font-style:normal;display:block;color:var(--mut);font-size:.72rem}
.tsx .viz .hi{position:absolute;right:22px;top:26px;font-weight:700;font-size:.9rem}
.tsx .kp{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.tsx .kp div{background:rgba(255,255,255,.1);border-radius:12px;padding:10px 12px;font-weight:800;font-size:1.15rem}.tsx .kp span{display:block;font-weight:500;font-size:.7rem;opacity:.75}
.tsx .bars{display:flex;align-items:flex-end;gap:9px;height:150px;padding:14px;background:rgba(255,255,255,.07);border-radius:14px}
.tsx .bars i{flex:1;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.35));transition:height .5s}
.tsx .viz small{display:block;margin-top:10px;opacity:.75}
/* CTA final */
.tsx .cta{position:relative;border-radius:22px;padding:56px;color:#fff;overflow:hidden;background:linear-gradient(160deg,var(--pri),var(--dk));display:flex;justify-content:space-between;align-items:flex-end;gap:28px;flex-wrap:wrap;box-shadow:var(--sh)}
.tsx .cta h2{color:#fff;margin-bottom:8px}.tsx .cta p{margin:0;color:rgba(255,255,255,.8);max-width:42ch}.tsx .cta .row{display:flex;gap:12px;flex-wrap:wrap}
.tsx .cta .btn.p{background:#fff;color:#0f1c45}.tsx .cta .btn.o{background:transparent;border-color:rgba(255,255,255,.35);color:#fff}
@media(max-width:980px){
 .tsx .sec{padding:68px 0}.tsx .perf{grid-template-columns:1fr;gap:32px}.tsx .rail{grid-auto-columns:84%;margin-inline:-24px;padding-inline:24px;scroll-padding-inline:24px}
 .tsx .arrows.hide-m{display:none}.tsx .ctl{justify-content:center}.tsx .fc{min-height:380px}
 .tsx .cta{padding:34px 26px}.tsx .kp{grid-template-columns:repeat(2,1fr)}}
@media(min-width:981px) and (max-width:1180px){.tsx .rail{grid-auto-columns:calc((100% - 20px)/2)}}
@media(prefers-reduced-motion:reduce){.tsx *{transition:none!important;scroll-behavior:auto!important}}
`;

export function TashoSectionsStyles() {
    return <style>{CSS}</style>;
}

/* ═════════ Sections ═════════ */
export function Trust({ lang = 'fr' }) {
    const t = T[lang] || T.fr;

    return (
        <div className="tsx">
            <div className="trust" id="confiance">
                <div className="wrap">
                    <small>{t.trust}</small>
                    <div className="logos">
                        {PARTNERS.map((p) => (
                            <span key={p}>{p}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Features({ lang = 'fr', images }) {
    const t = T[lang] || T.fr;
    const rail = useRef(null);
    const n = t.feats.length;
    const [st, setSt] = useState({ i: 0, prev: false, next: true });
    const step = () => (rail.current?.children[0]?.offsetWidth || 300) + 20;

    const measure = useCallback(() => {
        const el = rail.current;

        if (!el) {
            return;
        }

        const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

        setSt({
            i: end ? n - 1 : Math.min(n - 1, Math.round(el.scrollLeft / step())),
            prev: el.scrollLeft > 2,
            next: !end,
        });
    }, [n]);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure);

        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const to = (left) => rail.current?.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });

    const onKey = (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            to(rail.current.scrollLeft + step());
        }

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            to(rail.current.scrollLeft - step());
        }
    };

    return (
        <div className="tsx">
            <section className="sec alt" id="fonctions">
                <div className="wrap">
                    <div className="head c">
                        <h2>
                            {t.featLead}
                            <span className="accent">{t.featAccent}</span>.
                        </h2>
                        <p className="sub">{t.featSub}</p>
                    </div>

                    <div className="rail" ref={rail} onScroll={measure} onKeyDown={onKey} tabIndex={0}>
                        {t.feats.map((f, i) => (
                            <article key={f.t} className="fc">
                                {images?.[i] && <img src={images[i]} alt={f.alt} loading="lazy" />}
                                <h3>{f.t}</h3>
                            </article>
                        ))}
                    </div>

                    <div className="ctl">
                        <div className="dots">
                            {t.feats.map((f, k) => (
                                <button
                                    key={f.t}
                                    type="button"
                                    className={k === st.i ? 'on' : ''}
                                    aria-label={`${t.card} ${k + 1} : ${f.t}`}
                                    aria-current={k === st.i}
                                    onClick={() => to(k * step())}
                                />
                            ))}
                        </div>
                        <div className="arrows hide-m">
                            <button
                                type="button"
                                onClick={() => to(rail.current.scrollLeft - step())}
                                disabled={!st.prev}
                                aria-label={t.prev}
                            >
                                <Ic n="left" />
                            </button>
                            <button
                                type="button"
                                onClick={() => to(rail.current.scrollLeft + step())}
                                disabled={!st.next}
                                aria-label={t.next}
                            >
                                <Ic n="right" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const BARS = [
    [38, 52, 44, 66, 58, 82, 70, 92],
    [50, 64, 48, 80, 56, 72, 90, 76],
    [30, 46, 62, 52, 78, 68, 88, 96],
];

export function Platform({ lang = 'fr' }) {
    const t = T[lang] || T.fr;
    const [i, setI] = useState(0);
    const n = t.perf.length;
    const g = t.perf[i];

    return (
        <div className="tsx">
            <section className="sec" id="plateforme">
                <div className="wrap">
                    <div className="head">
                        <div>
                            <h2>{t.perfTitle}</h2>
                            <p className="sub">{t.perfSub}</p>
                        </div>
                        <a className="link" href="#pricing">
                            {t.perfLink}
                            <i>
                                <Ic n="arrow" s={16} />
                            </i>
                        </a>
                    </div>

                    <div className="perf">
                        <div>
                            <span className="count">
                                {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                            </span>
                            <div className="gi2">
                                <Ic n={PERF_ICONS[i]} />
                            </div>
                            <h3>{g.t}</h3>
                            <p className="d">{g.d}</p>
                            <div className="ctl" style={{ justifyContent: 'flex-start', gap: 22, marginTop: 0 }}>
                                <div className="arrows">
                                    <button
                                        type="button"
                                        onClick={() => setI((i - 1 + n) % n)}
                                        aria-label={t.prev}
                                    >
                                        <Ic n="left" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setI((i + 1) % n)}
                                        aria-label={t.next}
                                    >
                                        <Ic n="right" />
                                    </button>
                                </div>
                                <div className="dots">
                                    {t.perf.map((p, k) => (
                                        <button
                                            key={p.t}
                                            type="button"
                                            className={k === i ? 'on' : ''}
                                            aria-label={p.t}
                                            onClick={() => setI(k)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="viz" aria-hidden="true">
                            <div className="chip">
                                <Ic n={PERF_ICONS[i]} s={20} />
                                <div>
                                    <b>{g.chip}</b>
                                    <em>{g.chipS}</em>
                                </div>
                            </div>
                            <span className="hi">{t.hello}</span>
                            <div className="kp">
                                {t.kpis.map(([v, l]) => (
                                    <div key={l}>
                                        {v}
                                        <span>{l}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bars">
                                {BARS[i].map((h, k) => (
                                    <i key={k} style={{ height: h + '%' }} />
                                ))}
                            </div>
                            <small>{t.usage}</small>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function Cta({ lang = 'fr' }) {
    const t = T[lang] || T.fr;

    return (
        <div className="tsx">
            <section className="sec" style={{ paddingBottom: 72 }}>
                <div className="wrap">
                    <div className="cta">
                        <div>
                            <h2>{t.ctaTitle}</h2>
                            <p>{t.ctaSub}</p>
                        </div>
                        <div className="row">
                            <a className="btn p" href="/register">
                                {t.start}
                            </a>
                            <a className="btn o" href="/contact">
                                {t.sales}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* Rendu complet (les quatre sections d'affilée) */
export default function TashoSections({ lang = 'fr', images }) {
    const t = T[lang] || T.fr;

    return (
        <div className="tsx">
            <style>{CSS}</style>
            <Trust lang={lang} />
            <Features lang={lang} images={images} />
            <Platform lang={lang} />
            <Cta lang={lang} />
        </div>
    );
}
