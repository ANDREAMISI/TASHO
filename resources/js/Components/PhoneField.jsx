import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { PhoneInput } from 'react-international-phone';

/**
 * Normalise une valeur héritée vers le format E.164 attendu par la librairie.
 * Les anciennes valeurs peuvent être nationales (0812345678) ou contenir des espaces.
 */
function normalizeValue(value, defaultCountry) {
    if (!value) {
        return '';
    }

    const trimmed = String(value).trim();

    if (trimmed.startsWith('+')) {
        return `+${trimmed.replace(/\D/g, '')}`;
    }

    const parsed = parsePhoneNumberFromString(
        trimmed,
        String(defaultCountry).toUpperCase(),
    );

    return parsed?.number || trimmed;
}

/**
 * Champ téléphone basé sur react-international-phone.
 * La valeur transmise au formulaire est au format international E.164 (+243…).
 *
 * variant : "prime" pour les formulaires PrimeReact, "dark" pour les pages d'authentification.
 */
export default function PhoneField({
    id,
    name,
    value,
    onChange,
    placeholder = 'Numéro de téléphone',
    variant = 'prime',
    invalid = false,
    disabled = false,
    autoComplete = 'tel',
    defaultCountry = 'CD',
    className = '',
}) {
    const classes = [
        'tasho-phone-input',
        `tasho-phone-input--${variant}`,
        invalid ? 'tasho-phone-input--invalid' : '',
        disabled ? 'tasho-phone-input--disabled' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // react-international-phone attend un code ISO2 en minuscules (« cd »),
    // alors que libphonenumber-js attend des majuscules (« CD »).
    const country = String(defaultCountry).toLowerCase();

    const handleChange = (phone, meta) => {
        const dialDigits = String(meta.country.dialCode);
        const digits = phone.replace(/\D/g, '');
        const normalized = phone.replace(/[^\d+]/g, '');

        // Uniquement le code pays (ex. « +243 ») ne compte pas comme un numéro.
        onChange?.(
            digits.length > dialDigits.length ? normalized : '',
            meta,
        );
    };

    return (
        <div className={classes}>
            <PhoneInput
                value={normalizeValue(value, defaultCountry)}
                onChange={handleChange}
                defaultCountry={country}
                placeholder={placeholder}
                disabled={disabled}
                inputProps={{
                    id,
                    name,
                    autoComplete,
                    disabled,
                }}
            />
        </div>
    );
}
