import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    FaCloud,
    FaEnvelope,
    FaFolder,
    FaImages,
    FaLock,
    FaThLarge,
} from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const pageVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.18,
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

    const rightSectionVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                delayChildren: 0.5,
                staggerChildren: 0.12,
                ease: "easeInOut",
            },
        },
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

    const formVariants = {
        hidden: { opacity: 0, y: 60 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    };

    const bgAnimation = {
        backgroundPosition: ["50% 50%", "48% 52%", "50% 50%"],
    };

    const bgTransition = {
        duration: 30,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
    };

    return (
        <>
            <Head title="Connexion" />

            <motion.div
                className="min-h-screen bg-[url(/images/bg-total.png)] bg-cover bg-center flex items-center justify-center px-4 py-8"
                style={{ backgroundPosition: "50% 50%" }}
                animate={bgAnimation}
                transition={bgTransition}
            >
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={pageVariants}
                    className="w-full max-w-5xl shadow-blue-600  min-h-[80vh] lg:h-[88vh] bg-white rounded-[30px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2"
                >
                    {/* ================= LEFT ================= */}

                    <motion.div
                        variants={sectionVariants}
                        className="relative bg-gradient-to-br from-[#f8fbff] via-[#f5f9ff] to-[#edf4ff] p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
                    >
                        {/* Logo */}
                        <motion.div variants={itemVariants}>
                            <img
                                src="/images/logo.png"
                                alt="TASHO"
                                className="w-24 md:w-28"
                            />
                        </motion.div>

                        {/* Hero Image */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center my-4 relative"
                        >
                            {/* Animated Border Glow */}
                            <motion.div
                                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 p-[2px] opacity-0"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 4,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                }}
                                style={{
                                    backgroundSize: "200% 200%",
                                }}
                            >
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#f8fbff] via-[#f5f9ff] to-[#edf4ff]" />
                            </motion.div>

                            <motion.img
                                src="/images/hero-logo2.png"
                                alt="Hero"
                                className="w-full max-h-[280px] md:max-h-[380px] object-contain mx-auto relative z-10"
                                animate={{
                                    filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 20px rgba(59,130,246,0.4))", "drop-shadow(0 0 0px rgba(59,130,246,0))"],
                                }}
                                transition={{
                                    duration: 3,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                }}
                            />
                        </motion.div>

                        {/* Title */}
                        <motion.div variants={itemVariants}>
                            <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
                                Vos photos méritent
                                <br />
                                un{" "}
                                <span className="text-blue-600">
                                    espace sécurisé
                                </span>
                                .
                            </h1>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.div variants={itemVariants}>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                <em>Sauvegardez, organisez et partagez vos créations
                                    professionnelles en toute sécurité.</em>  
                            </p>

                        </motion.div>

                        {/* Glass Cards */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-3"
                        >
                            {/* Card 1 - Sécurisé */}
                            {/* <motion.div
                                className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50 hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <FaLock className="text-blue-600 text-lg mt-1" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">
                                            Sécurisé
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Vos fichiers sont protégés à 100%.
                                        </p>
                                    </div>
                                </div>
                            </motion.div> */}

                            {/* Card 2 - Accessible */}
                            {/* <motion.div
                                className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50 hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <FaCloud className="text-blue-600 text-lg mt-1" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">
                                            Accessible
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Accédez à vos photos partout.
                                        </p>
                                    </div>
                                </div>
                            </motion.div> */}

                            {/* Card 3 - Organisé */}
                            {/* <motion.div
                                className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50 hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <FaImages className="text-blue-600 text-lg mt-1" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">
                                            Organisé
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Retrouvez rapidement toutes vos
                                            créations.
                                        </p>
                                    </div>
                                </div>
                            </motion.div> */}
                        </motion.div>
                    </motion.div>

                    {/* ================= RIGHT ================= */}
                    <motion.div
                        variants={rightSectionVariants}
                        className="bg-[#071321] flex items-center justify-center px-6 py-8 md:px-10 md:py-10"
                    >
                        <div className="w-full max-w-lg">
                            <motion.h2
                                variants={itemVariants}
                                className="text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-10"
                            >
                                Se{" "}
                                <span className="text-blue-500">connecter</span>
                            </motion.h2>

                            {status && (
                                <motion.div
                                    variants={itemVariants}
                                    className="mb-5 rounded-lg bg-green-500/20 border border-green-500 text-green-300 px-4 py-3"
                                >
                                    {status}
                                </motion.div>
                            )}

                            <motion.form
                                onSubmit={submit}
                                className="space-y-6"
                                variants={formVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {/* EMAIL */}
                                <motion.div variants={itemVariants}>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <TextInput
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            placeholder="Adresse email"
                                            className="w-full h-14 rounded-xl bg-transparent border border-slate-600 pl-12 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/40 focus:shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-300"
                                        />
                                    </div>

                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </motion.div>

                                {/* PASSWORD */}
                                <motion.div variants={itemVariants}>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <TextInput
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Mot de passe"
                                            className="w-full h-14 rounded-xl bg-transparent border border-slate-600 pl-12 pr-14 text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/40 focus:shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-300"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <HiEyeOff size={22} />
                                            ) : (
                                                <HiEye size={22} />
                                            )}
                                        </button>
                                    </div>

                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </motion.div>

                                {/* REMEMBER */}
                                <motion.div variants={itemVariants}>
                                    <label className="flex items-center text-gray-300">
                                        <Checkbox
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked,
                                                )
                                            }
                                        />

                                        <span className="ml-3">
                                            Se souvenir de moi
                                        </span>
                                    </label>
                                </motion.div>

                                {/* BUTTON */}
                                <motion.div
                                    variants={itemVariants}
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
                                                Connexion...
                                            </span>
                                        ) : (
                                            "Connexion"
                                        )}
                                    </PrimaryButton>
                                </motion.div>

                                {/* REGISTER */}
                                <motion.div variants={itemVariants}>
                                    <div className="text-center text-gray-400">
                                        Pas encore inscrit ?
                                        <Link
                                            href={route("register")}
                                            className="ml-2 text-blue-400 hover:text-cyan-400 transition"
                                        >
                                            Créer un compte
                                        </Link>
                                    </div>
                                </motion.div>
                            </motion.form>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
}
