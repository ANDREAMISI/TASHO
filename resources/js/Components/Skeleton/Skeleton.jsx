/**
 * Bloc gris animé utilisé pour construire les squelettes de chargement.
 * `motion-reduce:animate-none` respecte `prefers-reduced-motion`.
 */
export default function Skeleton({ className = '', rounded = 'rounded-lg' }) {
    return (
        <div
            aria-hidden="true"
            className={`animate-pulse motion-reduce:animate-none ${rounded} bg-gray-200 ${className}`}
        />
    );
}
