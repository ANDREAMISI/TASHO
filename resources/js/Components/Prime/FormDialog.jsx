import { Dialog } from 'primereact/dialog';
import Button from '@/Components/Button';

/**
 * Modale de formulaire harmonisée (PrimeReact Dialog).
 *
 * Le formulaire est rendu dans `children` et doit porter l'id `formId`.
 * Le bouton de validation du footer soumet ce formulaire via l'attribut HTML `form`.
 */
export default function FormDialog({
    visible,
    onHide,
    title,
    description,
    icon = 'pi pi-pencil',
    children,
    footer,
    formId,
    onSubmit,
    submitLabel = 'Enregistrer',
    submitIcon = 'pi pi-check',
    cancelLabel = 'Annuler',
    processing = false,
    submitDisabled = false,
    danger = false,
    width = '36rem',
    closable = true,
}) {
    const defaultFooter = onSubmit ? (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                label={cancelLabel}
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={onHide}
                disabled={processing}
            />
            <Button
                type="submit"
                form={formId}
                label={processing ? 'Enregistrement…' : submitLabel}
                icon={submitIcon}
                loading={processing}
                disabled={processing || submitDisabled}
                severity={danger ? 'danger' : undefined}
                className={danger ? '' : '!bg-tasho-primary !border-tasho-primary'}
            />
        </div>
    ) : null;

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tasho-primary/10 text-tasho-primary">
                        <i className={icon} />
                    </span>
                    <div>
                        <p className="text-base font-semibold text-gray-900">{title}</p>
                        {description && (
                            <p className="mt-0.5 text-xs font-normal text-gray-500">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            }
            footer={footer ?? defaultFooter}
            style={{ width }}
            breakpoints={{ '640px': '94vw' }}
            modal
            draggable={false}
            resizable={false}
            closable={closable}
            className="app-form-dialog"
        >
            {children}
        </Dialog>
    );
}
