import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';

/**
 * Normalise une valeur héritée vers le format E.164 attendu par la librairie.
 * Les anciennes valeurs peuvent être nationales (0812345678) ou contenir des espaces.
 */
function normalizeValue(value, defaultCountry) {
    if (!value) {
        return undefined;
    }

    const trimmed = String(value).trim();
    const parsed = parsePhoneNumber(trimmed, defaultCountry);

    return parsed?.number || undefined;
}

/**
 * Champ téléphone basé sur react-phone-number-input.
 * La valeur transmise au formulaire est au format international E.164 (+243…).
 *
 * variant : "prime" pour les formulaires PrimeReact, "dark" pour les pages d'authentification.
 */
export default function PhoneField({
    id,
    name,
    value,
    onChange,
    placeholder = '+243 81 234 5678',
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
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <PhoneInput
            id={id}
            name={name}
            value={normalizeValue(value, defaultCountry)}
            onChange={(nextValue) => onChange?.(nextValue || '')}
            defaultCountry={defaultCountry}
            countryCallingCodeEditable={false}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            labels={{
                country: 'Choisir un pays',
                phone: 'Numéro de téléphone',
            }}
            className={classes}
            numberInputProps={{
                id,
                name,
                autoComplete,
                disabled,
                className: 'tasho-phone-input__input',
            }}
        />
    );
}
