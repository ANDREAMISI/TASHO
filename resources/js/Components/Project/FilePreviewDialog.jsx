import { Dialog } from 'primereact/dialog';
import { ArrowDownTrayIcon, DocumentIcon } from '@/Components/Icons';
import { formatBytes, formatDate } from '@/utils/format';
import { categoryMeta } from './projectMeta';

/**
 * Aperçu d'un fichier dans une modale.
 * Images, vidéos, audio et PDF sont lus depuis la route `files.stream`.
 */
export default function FilePreviewDialog({ file, onHide }) {
    const meta = file ? categoryMeta(file.category) : null;
    const Icon = meta?.icon || DocumentIcon;

    const footer = file ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
                <span>{formatBytes(file.size)}</span>
                <span>{file.mime_type}</span>
                <span>
                    {file.view_count} vue{file.view_count > 1 ? 's' : ''}
                </span>
                <span>{formatDate(file.created_at)}</span>
            </div>

            <a
                href={file.download_url}
                className="inline-flex items-center gap-1.5 rounded-lg bg-tasho-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tasho-primary/90"
            >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Télécharger
            </a>
        </div>
    ) : null;

    return (
        <Dialog
            visible={!!file}
            onHide={onHide}
            header={
                file ? (
                    <div className="min-w-0 pr-6">
                        <p className="truncate text-base font-semibold text-gray-900">{file.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {file.category_label} · {formatBytes(file.size)}
                        </p>
                    </div>
                ) : null
            }
            footer={footer}
            style={{ width: 'min(64rem, 94vw)' }}
            breakpoints={{ '768px': '94vw' }}
            modal
            draggable={false}
            resizable={false}
        >
            {file && (
                <div className="space-y-4">
                    <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-gray-950">
                        {file.is_image ? (
                            <img
                                src={file.stream_url}
                                alt={file.name}
                                className="max-h-[65vh] w-auto max-w-full object-contain"
                            />
                        ) : file.is_video ? (
                            <video
                                src={file.stream_url}
                                controls
                                playsInline
                                className="max-h-[65vh] w-full"
                            />
                        ) : file.is_audio ? (
                            <div className="w-full p-8">
                                <div className="mb-4 flex justify-center">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                                        <Icon className="h-8 w-8" />
                                    </span>
                                </div>
                                <audio src={file.stream_url} controls className="w-full" />
                            </div>
                        ) : file.is_pdf ? (
                            <iframe
                                src={file.stream_url}
                                title={file.name}
                                className="h-[65vh] w-full bg-white"
                            />
                        ) : (
                            <div className="px-8 py-14 text-center">
                                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                                    <Icon className="h-8 w-8" />
                                </span>
                                <p className="mt-4 text-sm font-medium text-white">
                                    Aperçu indisponible pour ce format
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Téléchargez le fichier pour l'ouvrir dans son application.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Dialog>
    );
}
