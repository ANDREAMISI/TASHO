/**
 * Champ de formulaire : libellé, contenu et erreur inline.
 */
export default function FormField({
    label,
    htmlFor,
    required = false,
    error,
    hint,
    children,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
            )}

            {children}

            {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
