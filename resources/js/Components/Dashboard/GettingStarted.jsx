import { Link } from '@inertiajs/react';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from '@/Components/Icons';

/**
 * Guide de démarrage affiché tant que les bases de l'espace client ne sont pas posées.
 * Chaque étape est validée à partir des données réelles de l'équipe.
 */
export default function GettingStarted({ projects, files, clients }) {
    const steps = [
        {
            key: 'project',
            title: 'Créer votre premier projet',
            description: 'Regroupez les livrables par client ou par campagne.',
            done: projects.total > 0,
            href: route('projects.index', { create: 1 }),
            cta: 'Créer un projet',
        },
        {
            key: 'files',
            title: 'Téléverser des fichiers',
            description: 'Images, vidéos ou documents : tout est centralisé.',
            done: files.total > 0,
            href: projects.total > 0 ? route('projects.index') : route('projects.index', { create: 1 }),
            cta: 'Ajouter des fichiers',
        },
        {
            key: 'clients',
            title: 'Inviter un client',
            description: 'Donnez-lui un accès en lecture à ses livrables.',
            done: clients.total > 0,
            href: route('clients.index'),
            cta: 'Ajouter un client',
        },
    ];

    const remaining = steps.filter((step) => !step.done).length;

    if (remaining === 0) {
        return null;
    }

    const completed = steps.length - remaining;

    return (
        <section className="overflow-hidden rounded-xl border border-tasho-primary/15 bg-gradient-to-br from-tasho-primary/[0.06] via-white to-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tasho-primary/10 px-5 py-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tasho-primary/10 text-tasho-primary">
                        <SparklesIcon className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            Finalisez votre espace
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {completed} étape{completed > 1 ? 's' : ''} sur {steps.length}{' '}
                            terminée{completed > 1 ? 's' : ''} · {remaining} restante
                            {remaining > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {steps.map((step) => (
                        <span
                            key={step.key}
                            className={`h-1.5 w-8 rounded-full ${
                                step.done ? 'bg-tasho-primary' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <ul className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {steps.map((step) => (
                    <li key={step.key} className="flex flex-col gap-2 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                                    step.done
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                {step.done ? <CheckIcon className="h-3 w-3" /> : '·'}
                            </span>
                            <p
                                className={`text-sm font-medium ${
                                    step.done ? 'text-gray-400 line-through' : 'text-gray-900'
                                }`}
                            >
                                {step.title}
                            </p>
                        </div>

                        <p className="text-xs leading-5 text-gray-500">{step.description}</p>

                        {!step.done && (
                            <Link
                                href={step.href}
                                className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-tasho-primary hover:underline"
                            >
                                {step.cta}
                                <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
