import { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { FaUser } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaCloud, FaImages, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Register({ professions, workTypes, storageVolumes }) {
    const [activeTab, setActiveTab] = useState("perso");

    const { data, setData, post, processing, errors, reset } = useForm({
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

    const submit = (e) => {
        e.preventDefault();
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
                        className="relative bg-gradient-to-br from-[#fff] via-[#fff] to-[#fff] p-6 md:p-8 flex flex-col justify-between gap-1 overflow-y-auto"
                    >
                        {/* Logo */}
                        <motion.div variants={itemVariants}>
                            <img
                                src="/Images/logo.png"
                                alt="TASHO"
                                className="w-24 md:w-28"
                            />
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
                            <h2 className="text-3xl font-bold text-center text-white mb-4 tracking-tight">
                                Créer{" "}
                                <span className="text-blue-500">un compte</span>
                            </h2>

                            {/* BARRE DES ONGLETS (TABS) */}
                            <div className="flex border-b border-slate-700 mb-6 text-sm">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("perso")}
                                    className={`flex-1 pb-3 flex items-center justify-center gap-2 font-medium border-b-2 transition-all duration-200 focus:outline-none ${
                                        activeTab === "perso"
                                            ? "border-blue-500 text-blue-500 font-semibold"
                                            : "border-transparent text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    <FaUser size="16px" color="currentColor" />{" "}
                                    Personnel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("pro")}
                                    className={`flex-1 pb-3 flex items-center justify-center gap-2 font-medium border-b-2 transition-all duration-200 focus:outline-none ${
                                        activeTab === "pro"
                                            ? "border-blue-500 text-blue-500 font-semibold"
                                            : "border-transparent text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    <FaBriefcase size="16px" color="currentColor" />{" "}
                                    Professionnel
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* VOLET 1 : Informations Personnelles */}
                                <div
                                    className={`space-y-4 rounded-3xl border border-slate-700 bg-white/5 p-6 shadow-inner transition-all duration-200 ${
                                        activeTab === "perso" ? "" : "hidden"
                                    }`}
                                >
                                    <div>
                                        <InputLabel
                                            htmlFor="name"
                                            value="Nom complet *"
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            required={activeTab === "perso"}
                                        />
                                        <InputError
                                            message={errors.name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="email"
                                            value="Email *"
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            autoComplete="username"
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            required={activeTab === "perso"}
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="phone"
                                            value="Téléphone"
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.phone}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="password"
                                            value="Mot de passe *"
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData("password", e.target.value)
                                            }
                                            required={activeTab === "perso"}
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="password_confirmation"
                                            value="Confirmer le mot de passe *"
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            required={activeTab === "perso"}
                                        />
                                        <InputError
                                            message={errors.password_confirmation}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* VOLET 2 : Informations Professionnelles */}
                                <div
                                    className={`space-y-4 rounded-3xl border border-slate-700 bg-white/5 p-6 shadow-inner transition-all duration-200 ${
                                        activeTab === "pro" ? "" : "hidden"
                                    }`}
                                >
                                    <div>
                                        <InputLabel
                                            htmlFor="profession"
                                            value="Métier *"
                                            className="text-gray-200"
                                        />
                                        <SelectInput
                                            id="profession"
                                            name="profession"
                                            value={data.profession}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            onChange={(e) =>
                                                setData("profession", e.target.value)
                                            }
                                            required={activeTab === "pro"}
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
                                            className="text-gray-200"
                                        />
                                        <TextInput
                                            id="country"
                                            type="text"
                                            name="country"
                                            value={data.country}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            onChange={(e) =>
                                                setData("country", e.target.value)
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
                                            className="text-gray-200"
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
                                                                setData(
                                                                    "work_type",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-4 w-4 text-blue-500 border-slate-600 bg-slate-900 focus:ring-blue-500"
                                                            required={
                                                                activeTab === "pro"
                                                            }
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
                                            className="text-gray-200"
                                        />
                                        <SelectInput
                                            id="storage_volume"
                                            name="storage_volume"
                                            value={data.storage_volume}
                                            className="mt-1.5 w-full h-10 rounded-xl bg-transparent border border-slate-600 px-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            onChange={(e) =>
                                                setData("storage_volume", e.target.value)
                                            }
                                            required={activeTab === "pro"}
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
                                </div>

                                {/* BOUTON - MAINTENANT AVEC LA MÊME TAILLE QUE LOGIN */}
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <PrimaryButton
                                        disabled={processing}
                                        className="w-full h-14 justify-center rounded-xl bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-base md:text-lg font-semibold transition duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
                                    >
                                        {processing ? (
                                            <span className="inline-flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                                                Inscription...
                                            </span>
                                        ) : (
                                            "S'inscrire"
                                        )}
                                    </PrimaryButton>
                                </motion.div>

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