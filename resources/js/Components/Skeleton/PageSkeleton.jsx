import Skeleton from './Skeleton';

function ScreenReaderLabel({ label }) {
    return <span className="sr-only">{label}</span>;
}

function PageHeaderSkeleton({ withActions = true }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56 sm:w-72" />
                <Skeleton className="h-4 w-64 sm:w-96" />
            </div>

            {withActions && (
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
            )}
        </div>
    );
}

function StatCardsSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 shrink-0" rounded="rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function RowsSkeleton({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-3 w-14 shrink-0" />
                </div>
            ))}
        </div>
    );
}

function CardSkeleton({ children, className = '' }) {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div
            role="status"
            className="mx-auto w-full max-w-7xl space-y-6"
        >
            <ScreenReaderLabel label="Chargement du tableau de bord…" />

            <PageHeaderSkeleton />
            <StatCardsSkeleton />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <CardSkeleton className="xl:col-span-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-2 h-3 w-64" />
                    <Skeleton className="mt-6 h-60 w-full" />
                </CardSkeleton>

                <CardSkeleton>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-2 h-3 w-44" />
                    <div className="mt-6">
                        <RowsSkeleton rows={5} />
                    </div>
                </CardSkeleton>
            </div>

            <CardSkeleton>
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-3 w-56" />
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-16 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardSkeleton>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-7xl space-y-6">
            <ScreenReaderLabel label="Chargement de la page…" />

            <PageHeaderSkeleton />

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                    <Skeleton className="h-10 w-full sm:w-72" />
                    <Skeleton className="h-10 w-28" />
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 px-4 py-3 md:grid">
                    <Skeleton className="col-span-5 h-3 w-24" />
                    <Skeleton className="col-span-2 h-3 w-16" />
                    <Skeleton className="col-span-2 h-3 w-20" />
                    <Skeleton className="col-span-1 h-3 w-14" />
                    <Skeleton className="col-span-2 h-3 w-20" />
                </div>

                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 gap-3 border-b border-gray-100 px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-4"
                    >
                        <div className="flex items-center gap-3 md:col-span-5">
                            <Skeleton
                                className="h-10 w-10 shrink-0"
                                rounded="rounded-full"
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-40 max-w-full" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="md:col-span-2">
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="md:col-span-1">
                            <Skeleton className="h-6 w-16" rounded="rounded-full" />
                        </div>
                        <div className="flex gap-2 md:col-span-2 md:justify-end">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-5xl space-y-6">
            <ScreenReaderLabel label="Chargement de la page…" />

            <PageHeaderSkeleton />

            <CardSkeleton>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Skeleton className="h-16 w-16 shrink-0" rounded="rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    ))}
                </div>
            </CardSkeleton>

            <CardSkeleton>
                <Skeleton className="h-5 w-40" />
                <div className="mt-5">
                    <RowsSkeleton rows={4} />
                </div>
            </CardSkeleton>
        </div>
    );
}

/**
 * Squelette affiché à l'intérieur de la carte des pages invitées
 * (mot de passe oublié, vérification d'email, invitations…).
 */
export function AuthSkeleton() {
    return (
        <div role="status" className="space-y-5 py-2">
            <ScreenReaderLabel label="Chargement du formulaire…" />

            <Skeleton className="mx-auto h-6 w-40" />

            <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                ))}
            </div>

            <Skeleton className="h-11 w-full" />
            <Skeleton className="mx-auto h-3.5 w-48" />
        </div>
    );
}

const LIST_PATHS =
    /\/(projects|clients|team|shares|activity|users|plans|subscriptions|teams|invitations|notifications)\/?$/;

/**
 * Choisit le squelette le plus proche de la page cible.
 * Ex. : /dashboard → tableau de bord, /clients → liste, /projects/12 → détail.
 */
export default function PageSkeleton({ path = '' }) {
    const pathname = String(path).split('?')[0];

    if (/\/dashboard\/?$/.test(pathname)) {
        return <DashboardSkeleton />;
    }

    if (LIST_PATHS.test(pathname)) {
        return <ListSkeleton />;
    }

    return <DetailSkeleton />;
}
