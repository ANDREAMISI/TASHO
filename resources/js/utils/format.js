import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const BYTE_UNITS = ['o', 'Ko', 'Mo', 'Go', 'To'];

/**
 * Formate un poids en octets avec les unités françaises (o, Ko, Mo, Go, To).
 */
export function formatBytes(bytes, decimals = 1) {
    const value = Number(bytes) || 0;

    if (value <= 0) {
        return '0 o';
    }

    const exponent = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        BYTE_UNITS.length - 1,
    );
    const size = value / 1024 ** exponent;

    return `${size.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: exponent === 0 ? 0 : decimals,
    })} ${BYTE_UNITS[exponent]}`;
}

/**
 * Formate un nombre avec les séparateurs français.
 */
export function formatNumber(value) {
    return (Number(value) || 0).toLocaleString('fr-FR');
}

/**
 * Accorde un nom commun au singulier ou au pluriel (0 et 1 restent au singulier).
 */
export function plural(count, singular, pluralForm) {
    const value = Number(count) || 0;

    return `${formatNumber(value)} ${value > 1 ? pluralForm : singular}`;
}

/**
 * « il y a 2 mois », « il y a 3 jours »…
 */
export function timeAgo(date) {
    if (!date) {
        return '';
    }

    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

/**
 * « 28 oct. 2026 »
 */
export function formatDate(date) {
    if (!date) {
        return '';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
