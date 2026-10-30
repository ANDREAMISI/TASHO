import { Head } from '@inertiajs/react';
import { ClockIcon } from '@/Components/Icons';

export default function GalleryExpired({ projectTitle }) {
    return (
        <>
            <Head title="Galerie expirée" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <img
                            src="/Images/logo.png"
                            alt="TASHO"
                            className="h-16 w-16 object-contain"
                        />
                        <span className="text-lg font-black tracking-[0.14em] text-slate-900">
                            TASHO
                        </span>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <ClockIcon className="h-8 w-8 text-amber-600" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Galerie expirée</h1>
                        {projectTitle && (
                            <p className="mt-1 text-sm text-gray-500">{projectTitle}</p>
                        )}
                        <p className="mt-4 text-sm text-gray-600">
                            Ce lien de partage n’est plus valide. Sa date d’expiration est dépassée.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Contactez la personne qui vous a partagé cette galerie pour obtenir un
                            nouveau lien.
                        </p>
                    </div>

                    <p className="text-xs text-gray-400">
                        Si vous êtes le propriétaire de cette galerie, connectez-vous à TASHO pour
                        créer un nouveau partage.
                    </p>
                </div>
            </div>
        </>
    );
}
