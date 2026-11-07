import { useEffect, useRef, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Button from "@/Components/Button";
import {
    FaArrowLeft,
    FaArrowRight,
    FaBriefcase,
    FaCheck,
    FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

const STEPS = [
    { id: 1, label: "Personnel", icon: FaUser },
    { id: 2, label: "Professionnel", icon: FaBriefcase },
];

const inputClass =
    "mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500";

const primaryButtonClass =
    "w-full h-14 justify-center rounded-xl bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-base md:text-lg font-semibold transition duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]";

const stepMotion = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut" },
};

export default function Register({ professions, workTypes, storageVolumes }) {
    const [step, setStep] = useState(1);
    const [clientErrors, setClientErrors] = useState({});
    const [phoneCountry, setPhoneCountry] = useState(null);
    const proFirstFieldRef = useRef(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        country: "",
        profession: "",
        work_type: "alone",
        storage_volume: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    // À l'arrivée sur l'étape professionnelle, on place le focus sur le
    // premier champ pour les utilisateurs au clavier et les lecteurs d'écran.
    useEffect(() => {
        if (step === 2) {
            proFirstFieldRef.current?.focus?.();
        }
    }, [step]);

    // Si le serveur renvoie une erreur sur une information personnelle,
    // on revient automatiquement à la première étape.
    useEffect(() => {
        const personalError =
            errors.name ||
            errors.email ||
            errors.password ||
            errors.password_confirmation;

        if (step === 2 && personalError) {
            setStep(1);
        }
    }, [errors, step]);

    const update = (field, value) => {
        setData(field, value);
        clearErrors(field);

        setClientErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const validatePersonalStep = () => {
        const next = {};

        if (!data.name.trim()) {
            next.name = "Votre nom complet est requis.";
        }

        if (!data.email.trim()) {
            next.email = "Votre adresse email est requise.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            next.email = "Adresse email invalide.";
        }

        if (!data.password) {
            next.password = "Choisissez un mot de passe.";
        } else if (data.password.length < 8) {
            next.password = "Le mot de passe doit contenir au moins 8 caractères.";
        }

        if (!data.password_confirmation) {
            next.password_confirmation = "Confirmez votre mot de passe.";
        } else if (data.password !== data.password_confirmation) {
            next.password_confirmation = "Les mots de passe ne correspondent pas.";
        }

        if (data.phone) {
            let phoneIsValid = true;

            try {
                phoneIsValid = isValidPhoneNumber(data.phone);
            } catch {
                phoneIsValid = false;
            }

            if (!phoneIsValid) {
                const country = phoneCountry?.name
                    ? ` pour ${phoneCountry.name}`
                    : "";
                next.phone = `Numéro de téléphone invalide${country}. Vérifiez le nombre de chiffres.`;
            }
        }

        setClientErrors(next);

        return Object.keys(next).length === 0;
    };

    const goToProfessionalStep = () => {
        if (validatePersonalStep()) {
            setStep(2);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (step !== 2) {
            goToProfessionalStep();
            return;
        }

        post(route("register"));
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.65,
                ease: "easeInOut",
            },
        },
    };

    const sectionVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.18,
                delayChildren: 0.12,
                ease: "easeInOut",
            },
        },
    };

    return (
        <>
            <Head title="Inscription" />

            <div className="min-h-screen bg-[url(/Images/bg-total.png)] bg-cover bg-center flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-5xl rounded-[35px] overflow-hidden shadow-2xl shadow-blue-600 grid lg:grid-cols-2 border bg-gradient-to-br from-slate-950/95 to-slate-900/95">
                    {/* ================= LEFT ================= */}
                    <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="show"
                        className="relative hidden bg-gradient-to-br from-[#fff] via-[#fff] to-[#fff] p-6 md:p-8 lg:flex lg:flex-col lg:justify-between gap-1 overflow-y-auto"
                    >
                        {/* Logo cliquable : retour à l'accueil */}
                        <motion.div variants={itemVariants}>
                            <Link
                                href="/"
                                aria-label="Retour à l'accueil"
                                className="flex w-fit items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                <img
                                    src="/Images/logo.png"
                                    alt="TASHO"
                                    className="h-24 w-24 shrink-0 object-contain md:h-28 md:w-28"
                                />
                                <span className="text-2xl font-black tracking-[0.14em] text-slate-900">
                                    TASHO
                                </span>
                            </Link>
                        </motion.div>

                        {/* Hero Image */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center my-1 md:my-2 relative"
                        >
                            <motion.img
                                src="/Images/img-register1.png"
                                alt="Hero"
                                className="w-full max-h-[300px] md:max-h-[400px] object-contain mx-auto relative z-10"
                            />
                        </motion.div>

                        {/* Title */}
                        <motion.div variants={itemVariants} className="mb-2">
                            <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
                                Commencez votre
                                <br />
                                <span className="text-blue-600">
                                    aventure numérique
                                </span>
                                .
                            </h1>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.div variants={itemVariants} className="">
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                <em>Sauvegardez, organisez et partagez vos médias facilement.</em>
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* ================= RIGHT ================= */}
                    <div className="bg-[#071321] flex items-center justify-center px-6 py-6">
                        <div className="w-full max-w-md">
                            {/* Logo mobile : la colonne de gauche est masquée */}
                            <Link
                                href="/"
                                aria-label="Retour à l'accueil"
                                className="mx-auto mb-5 flex w-fit items-center gap-2.5 rounded-lg px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071321] lg:hidden"
                            >
                                <img
                                    src="/Images/logo.png"
                                    alt="TASHO"
                                    className="h-12 w-12 object-contain"
                                />
                                <span className="text-lg font-black tracking-[0.14em] text-white">
                                    TASHO
                                </span>
                            </Link>

                            <h2 className="text-3xl font-bold text-center text-white mb-4 tracking-tight">
                                Créer{" "}
                                <span className="text-blue-500">un compte</span>
                            </h2>

                            {/* STEPPER */}
                            <ol className="mb-7 flex items-start">
                                {STEPS.map((stepItem, index) => {
                                    const isActive = step === stepItem.id;
                                    const isCompleted = step > stepItem.id;
                                    const Icon = stepItem.icon;

                                    return (
                                        <li
                                            key={stepItem.id}
                                            aria-current={isActive ? "step" : undefined}
                                            className={`flex items-center ${
                                                index === STEPS.length - 1
                                                    ? ""
                                                    : "flex-1"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    aria-hidden="true"
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                                                        isCompleted
                                                            ? "border-blue-500 bg-blue-500 text-white"
                                                            : isActive
                                                              ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                                              : "border-slate-600 text-slate-500"
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <FaCheck size={11} />
                                                    ) : (
                                                        <Icon size={13} />
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <span
                                                        className={`block text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                                            isActive || isCompleted
                                                                ? "text-blue-400"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        Étape {stepItem.id}
                                                    </span>
                                                    <span
                                                        className={`block whitespace-nowrap text-sm font-semibold ${
                                                            isActive
                                                                ? "text-white"
                                                                : isCompleted
                                                                  ? "text-slate-200"
                                                                  : "text-slate-500"
                                                        }`}
                                                    >
                                                        {stepItem.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {index < STEPS.length - 1 && (
                                                <span
                                                    aria-hidden="true"
                                                    className={`mx-3 h-px flex-1 rounded-full ${
                                                        isCompleted
                                                            ? "bg-blue-500"
                                                            : "bg-slate-700"
                                                    }`}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>

                            <form onSubmit={submit} className="space-y-6">
                                {/* ÉTAPE 1 : Informations personnelles */}
                                {step === 1 && (
                                    <motion.div
                                        key="personal-step"
                                        {...stepMotion}
                                        className="space-y-4 rounded-3xl border border-slate-700 bg-white/5 p-6 shadow-inner"
                                    >
                                        <div>
                                            <h3 className="text-base font-semibold text-white">
                                                Informations personnelles
                                            </h3>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Votre identité et vos accès à la plateforme.
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="name"
                                                value="Nom complet *"
                                                className="!text-gray-200"
                                            />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                className={inputClass}
                                                autoComplete="name"
                                                isFocused={true}
                                                onChange={(e) =>
                                                    update("name", e.target.value)
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.name || clientErrors.name}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="email"
                                                value="Email *"
                                                className="!text-gray-200"
                                            />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className={inputClass}
                                                autoComplete="username"
                                                onChange={(e) =>
                                                    update("email", e.target.value)
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.email || clientErrors.email}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="phone"
                                                value="Téléphone"
                                                className="!text-gray-200"
                                            />
                                            <div className="phone-field mt-1.5">
                                                <PhoneInput
                                                    defaultCountry="bi"
                                                    value={data.phone}
                                                    onChange={(phone, meta) => {
                                                        setPhoneCountry(meta.country);

                                                        const dialDigits = String(
                                                            meta.country.dialCode,
                                                        );
                                                        const digits = phone.replace(
                                                            /\D/g,
                                                            "",
                                                        );
                                                        const normalized =
                                                            phone.replace(
                                                                /[^\d+]/g,
                                                                "",
                                                            );

                                                        update(
                                                            "phone",
                                                            digits.length >
                                                                dialDigits.length
                                                                ? normalized
                                                                : "",
                                                        );
                                                    }}
                                                    inputProps={{
                                                        id: "phone",
                                                        name: "phone",
                                                        autoComplete: "tel",
                                                    }}
                                                    placeholder="Numéro de téléphone"
                                                    className="w-full"
                                                />
                                            </div>
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Le format dépend du pays sélectionné (ex. 8 chiffres au Burundi).
                                            </p>
                                            <InputError
                                                message={errors.phone || clientErrors.phone}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="password"
                                                value="Mot de passe *"
                                                className="!text-gray-200"
                                            />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className={inputClass}
                                                autoComplete="new-password"
                                                onChange={(e) =>
                                                    update("password", e.target.value)
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.password ||
                                                    clientErrors.password
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="password_confirmation"
                                                value="Confirmer le mot de passe *"
                                                className="!text-gray-200"
                                            />
                                            <TextInput
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                className={inputClass}
                                                autoComplete="new-password"
                                                onChange={(e) =>
                                                    update(
                                                        "password_confirmation",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation ||
                                                    clientErrors.password_confirmation
                                                }
                                                className="mt-2"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* ÉTAPE 2 : Informations professionnelles */}
                                {step === 2 && (
                                    <motion.div
                                        key="professional-step"
                                        {...stepMotion}
                                        className="space-y-4 rounded-3xl border border-slate-700 bg-white/5 p-6 shadow-inner"
                                    >
                                        <div>
                                            <h3 className="text-base font-semibold text-white">
                                                Informations professionnelles
                                            </h3>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Votre activité et vos besoins de stockage.
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="profession"
                                                value="Métier *"
                                                className="!text-gray-200"
                                            />
                                            <SelectInput
                                                ref={proFirstFieldRef}
                                                id="profession"
                                                name="profession"
                                                value={data.profession}
                                                className={inputClass}
                                                onChange={(e) =>
                                                    update(
                                                        "profession",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="" className="text-slate-600">
                                                    Sélectionnez votre métier
                                                </option>
                                                {professions.map((profession) => (
                                                    <option
                                                        key={profession}
                                                        value={profession}
                                                        className="text-slate-900 bg-transparent placeholder-gray-400"
                                                    >
                                                        {profession}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            <InputError
                                                message={errors.profession}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="country"
                                                value="Pays"
                                                className="!text-gray-200"
                                            />
                                            <CountrySelect
                                                id="country"
                                                name="country"
                                                defaultValue={data.country || undefined}
                                                containerClassName="register-country-select mt-1.5 w-full"
                                                inputClassName="h-10 w-full bg-transparent px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                                                placeHolder="Rechercher ou sélectionner un pays"
                                                onChange={(country) =>
                                                    update("country", country.name)
                                                }
                                                onTextChange={() =>
                                                    update("country", "")
                                                }
                                            />
                                            <InputError
                                                message={errors.country}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="work_type"
                                                value="Travaillez-vous ? *"
                                                className="!text-gray-200"
                                            />
                                            <div className="mt-1.5 grid gap-3">
                                                {Object.entries(workTypes).map(
                                                    ([value, label]) => (
                                                        <label
                                                            key={value}
                                                            className="flex items-center rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-white transition hover:border-blue-500"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="work_type"
                                                                value={value}
                                                                checked={
                                                                    data.work_type === value
                                                                }
                                                                onChange={(e) =>
                                                                    update(
                                                                        "work_type",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-4 w-4 text-blue-500 border-slate-600 bg-slate-900 focus:ring-blue-500"
                                                                required
                                                            />
                                                            <span className="ml-3 text-sm">
                                                                {label}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={errors.work_type}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="storage_volume"
                                                value="Volume de stockage utilisé *"
                                                className="!text-gray-200"
                                            />
                                            <SelectInput
                                                id="storage_volume"
                                                name="storage_volume"
                                                value={data.storage_volume}
                                                className={inputClass}
                                                onChange={(e) =>
                                                    update(
                                                        "storage_volume",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="" className="text-slate-600">
                                                    Sélectionnez le volume
                                                </option>
                                                {storageVolumes.map((volume) => (
                                                    <option
                                                        key={volume}
                                                        value={volume}
                                                        className="text-slate-900"
                                                    >
                                                        {volume}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            <InputError
                                                message={errors.storage_volume}
                                                className="mt-2"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* NAVIGATION DU STEPPER */}
                                {step === 1 ? (
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.96 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={goToProfessionalStep}
                                            className={`${primaryButtonClass} inline-flex items-center justify-center gap-2`}
                                        >
                                            Continuer
                                            <FaArrowRight size={14} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row-reverse">
                                        <motion.div
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.96 }}
                                            transition={{
                                                duration: 0.2,
                                                ease: "easeInOut",
                                            }}
                                            className="sm:flex-1"
                                        >
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className={primaryButtonClass}
                                            >
                                                {processing ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                                                        Inscription...
                                                    </span>
                                                ) : (
                                                    "S'inscrire"
                                                )}
                                            </Button>
                                        </motion.div>

                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-white/5"
                                        >
                                            <FaArrowLeft size={12} />
                                            Retour
                                        </button>
                                    </div>
                                )}

                                {/* LOGIN */}
                                <div className="text-center text-gray-400">
                                    Déjà inscrit ?
                                    <Link
                                        href={route("login")}
                                        className="ml-2 text-blue-400 hover:text-cyan-400 transition"
                                    >
                                        Connectez-vous
                                    </Link>
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-gray-400">
                                        En créant un compte, vous acceptez nos{" "}
                                        <a
                                            href="#"
                                            className="text-blue-400 hover:text-cyan-300 underline"
                                        >
                                            Conditions d'utilisation
                                        </a>{" "}
                                        et notre{" "}
                                        <a
                                            href="#"
                                            className="text-blue-400 hover:text-cyan-300 underline"
                                        >
                                            Politique de confidentialité
                                        </a>
                                        .
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
