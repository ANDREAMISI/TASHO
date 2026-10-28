import { useEffect, useState } from 'react';

/**
 * Lit un media query dès le premier rendu.
 *
 * Le `useMatchMedia` de PrimeReact renvoie toujours `false` au premier rendu
 * (la valeur réelle est appliquée dans un `useEffect`), ce qui provoque un
 * décalage de mise en page visible au chargement d'une page.
 */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(query).matches,
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = (event) => setMatches(event.matches);

        setMatches(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}
