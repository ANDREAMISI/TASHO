/**
 * Coquille commune aux blocs du dashboard : titre, description, action à droite.
 */
export default function DashboardCard({ title, description, action, children, className = '' }) {
    return (
        <section
            className={`flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
        >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                    )}
                </div>
                {action}
            </header>

            <div className="flex-1 px-5 py-4">{children}</div>
        </section>
    );
}
