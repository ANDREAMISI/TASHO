import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import Button from '@/Components/Button';
import { Camera, PhotoIcon } from '@/Components/Icons';

const STAGE = 240;
const OUTPUT = 512;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Modale de recadrage de la photo de profil.
 *
 * L'image est affichée dans un masque circulaire : déplacement à la souris
 * (ou au doigt) et zoom. L'export produit un carré 512×512 envoyé au serveur.
 */
export default function AvatarCropDialog({
    visible,
    onHide,
    onUpload,
    onRemove,
    hasAvatar = false,
    processing = false,
}) {
    const [src, setSrc] = useState(null);
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const dragStart = useRef(null);

    useEffect(() => {
        if (!src) {
            return undefined;
        }

        return () => URL.revokeObjectURL(src);
    }, [src]);

    useEffect(() => {
        if (visible) {
            return;
        }

        setSrc(null);
        setImage(null);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setError(null);
        setDragging(false);
        dragStart.current = null;
    }, [visible]);

    const geometry = useMemo(() => {
        if (!image) {
            return null;
        }

        const base = Math.max(STAGE / image.naturalWidth, STAGE / image.naturalHeight);
        const scale = base * zoom;
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const maxX = Math.max((width - STAGE) / 2, 0);
        const maxY = Math.max((height - STAGE) / 2, 0);
        const x = clamp(offset.x, -maxX, maxX);
        const y = clamp(offset.y, -maxY, maxY);

        return {
            width,
            height,
            left: (STAGE - width) / 2 + x,
            top: (STAGE - height) / 2 + y,
            x,
            y,
            maxX,
            maxY,
        };
    }, [image, zoom, offset]);

    const handleFile = (file) => {
        if (!file) {
            return;
        }

        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
            setError('Choisissez une image JPG, PNG ou WebP.');
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setError('L’image ne doit pas dépasser 8 Mo.');
            return;
        }

        setError(null);
        setZoom(1);
        setOffset({ x: 0, y: 0 });

        const url = URL.createObjectURL(file);
        const nextImage = new Image();

        nextImage.onload = () => {
            setImage(nextImage);
            setSrc(url);
        };

        nextImage.onerror = () => {
            URL.revokeObjectURL(url);
            setError('Impossible de lire cette image.');
        };

        nextImage.src = url;
    };

    const handlePointerDown = (event) => {
        if (!geometry || processing) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = {
            px: event.clientX,
            py: event.clientY,
            x: geometry.x,
            y: geometry.y,
        };
        setDragging(true);
    };

    const handlePointerMove = (event) => {
        if (!dragStart.current || !geometry) {
            return;
        }

        const dx = event.clientX - dragStart.current.px;
        const dy = event.clientY - dragStart.current.py;

        setOffset({
            x: clamp(dragStart.current.x + dx, -geometry.maxX, geometry.maxX),
            y: clamp(dragStart.current.y + dy, -geometry.maxY, geometry.maxY),
        });
    };

    const stopDragging = () => {
        dragStart.current = null;
        setDragging(false);
    };

    const submit = () => {
        if (!image || !geometry) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT;
        canvas.height = OUTPUT;

        const context = canvas.getContext('2d');
        const ratio = OUTPUT / STAGE;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, OUTPUT, OUTPUT);
        context.drawImage(
            image,
            geometry.left * ratio,
            geometry.top * ratio,
            geometry.width * ratio,
            geometry.height * ratio,
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setError('Le recadrage a échoué, réessayez.');
                    return;
                }

                onUpload(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.9,
        );
    };

    const footer = (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                {hasAvatar && (
                    <Button
                        type="button"
                        label="Supprimer la photo"
                        icon="pi pi-trash"
                        text
                        severity="danger"
                        onClick={onRemove}
                        disabled={processing}
                    />
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    label="Annuler"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    onClick={onHide}
                    disabled={processing}
                />
                <Button
                    type="button"
                    label={processing ? 'Enregistrement…' : 'Enregistrer la photo'}
                    icon="pi pi-check"
                    onClick={submit}
                    loading={processing}
                    disabled={processing || !image}
                    className="!bg-tasho-primary !border-tasho-primary"
                />
            </div>
        </div>
    );

    return (
        <Dialog
            visible={visible}
            onHide={processing ? () => {} : onHide}
            header={
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tasho-primary/10 text-tasho-primary">
                        <Camera className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-base font-semibold text-gray-900">Photo de profil</p>
                        <p className="mt-0.5 text-xs font-normal text-gray-500">
                            Recadrez votre image dans le cercle.
                        </p>
                    </div>
                </div>
            }
            footer={footer}
            style={{ width: '30rem' }}
            breakpoints={{ '640px': '94vw' }}
            modal
            draggable={false}
            resizable={false}
            closable={!processing}
            className="app-form-dialog"
        >
            <div className="space-y-4">
                {!image ? (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-10 text-center transition hover:border-tasho-primary/40 hover:bg-tasho-primary/5"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-tasho-primary shadow-sm">
                            <PhotoIcon className="h-6 w-6" />
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                            Choisir une image
                        </span>
                        <span className="text-xs text-gray-500">JPG, PNG ou WebP · 8 Mo max.</span>
                    </button>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <div
                                role="application"
                                aria-label="Zone de recadrage"
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={stopDragging}
                                onPointerCancel={stopDragging}
                                className="relative overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-inner"
                                style={{
                                    width: STAGE,
                                    height: STAGE,
                                    cursor: dragging ? 'grabbing' : 'grab',
                                    maxWidth: '100%',
                                    touchAction: 'none',
                                }}
                            >
                                <img
                                    src={src}
                                    alt="Aperçu de la photo de profil"
                                    draggable={false}
                                    className="absolute select-none"
                                    style={{
                                        width: geometry.width,
                                        height: geometry.height,
                                        left: geometry.left,
                                        top: geometry.top,
                                    }}
                                />

                                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                                <span>Zoom</span>
                                <span>{Math.round(zoom * 100)} %</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.01"
                                value={zoom}
                                onChange={(event) => setZoom(Number(event.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-tasho-primary"
                                aria-label="Zoom de la photo"
                                disabled={processing}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                            <span>Déplacez l’image pour la centrer.</span>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="font-medium text-tasho-primary transition hover:text-tasho-primary/80"
                                disabled={processing}
                            >
                                Changer d’image
                            </button>
                        </div>
                    </>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.target.value = '';
                    }}
                />

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}
            </div>
        </Dialog>
    );
}
