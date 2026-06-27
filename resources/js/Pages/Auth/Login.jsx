import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
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

    return (
        <>
            <Head title="Connexion" />

            <div className="min-h-screen bg-[#edf3fb] flex items-center justify-center px-4 py-8">

                <div className="w-full max-w-5xl h-[88vh] bg-white rounded-[30px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
                    {/* ================= LEFT ================= */}

                    <div className="relative bg-gradient-to-br from-[#eef5ff] via-[#f7fbff] to-[#dbeafe] p-12 flex flex-col justify-between">

                        {/* Logo */}

                        <div>
                            <img
                                src="/images/logo.png"
                                alt="TASHO"
                                className="w-32"
                            />
                        </div>

                        {/* Camera */}

                        <div className="flex justify-center ">

                            <img
                                src="/images/camera1.png"
                                alt="Camera"
                                className="max-h-[330px] object-contain mx-auto drop-shadow-[0_35px_70px_rgba(0,0,0,0.25)] transition duration-500 hover:scale-105"
                               />

                        </div>

                        {/* Text */}

                        <div>

                            <h1 className="text-2xl font-extrabold leading-tight">
                                


                                Protégez {" "}

                                <span className="text-blue-600">
                                    vos souvenirs,
                                </span>

                                <br />

                                Organisez {" "}

                                <span className="text-cyan-500">
                                    vos créations.
                                </span>

                            </h1>
                            

                            <p className="mt-4 text-gray-600 max-w-md">

                            <em>Rejoignez TASHO et sauvegardez vos fichiers multimédias en toute sécurité.</em>
                               
                            </p>

                        </div>

                    </div>

                    {/* ================= RIGHT ================= */}

                    <div className="bg-[#071321] flex items-center justify-center px-10 py-8">

                        <div className="w-full max-w-lg">

                            <h2 className="text-4xl font-bold text-white text-center mb-10">

                                Se{" "}

                                <span className="text-blue-500">
                                    connecter
                                </span>

                            </h2>

                            {status && (
                                <div className="mb-5 rounded-lg bg-green-500/20 border border-green-500 text-green-300 px-4 py-3">
                                    {status}
                                </div>
                            )}

                            <form
                                onSubmit={submit}
                                className="space-y-6"
                            >

                                {/* EMAIL */}

                                <div>

                                    <div className="relative">

                                        <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <TextInput
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Adresse email"
                                            className="w-full h-14 rounded-xl bg-transparent border border-slate-600 pl-14 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                        />

                                    </div>

                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />

                                </div>

                                {/* PASSWORD */}

                                <div>

                                    <div className="relative">

                                        <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

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
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Mot de passe"
                                            className="w-full h-14 rounded-xl bg-transparent border border-slate-600 pl-14 pr-14 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
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

                                </div>

                                {/* REMEMBER */}

                                <label className="flex items-center text-gray-300">

                                    <Checkbox
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span className="ml-3">
                                        Se souvenir de moi
                                    </span>

                                </label>

                                {/* BUTTON */}

                                <PrimaryButton
                                    disabled={processing}
                                    className="w-full h-14 justify-center rounded-xl bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-lg font-semibold hover:scale-[1.02] transition duration-300 shadow-lg"
                                >
                                    Connexion
                                </PrimaryButton>

                                {/* REGISTER */}

                                <div className="text-center text-gray-400">

                                    Pas encore inscrit ?

                                    <Link
                                        href={route("register")}
                                        className="ml-2 text-blue-400 hover:text-cyan-400 transition"
                                    >
                                        Créer un compte
                                    </Link>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}