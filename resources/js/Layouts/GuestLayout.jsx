import ApplicationLogo from '@/Components/ApplicationLogo';
import { AuthSkeleton } from '@/Components/Skeleton/PageSkeleton';
import usePageSkeleton from '@/hooks/usePageSkeleton';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const skeletonPath = usePageSkeleton();

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <ApplicationLogo className="h-20 w-20 object-contain" />
                    <span className="text-xl font-black tracking-[0.14em] text-gray-900">
                        TASHO
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {skeletonPath ? <AuthSkeleton /> : children}
            </div>
        </div>
    );
}
