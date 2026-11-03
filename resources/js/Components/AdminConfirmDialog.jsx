import { confirmDialog } from 'primereact/confirmdialog';

export default function confirmAdminAction({
    message,
    header = 'Confirmer l’action',
    onAccept,
    danger = false,
}) {
    confirmDialog({
        header,
        message,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: danger ? 'Supprimer' : 'Confirmer',
        rejectLabel: 'Annuler',
        acceptClassName: danger ? 'p-button-danger' : undefined,
        accept: onAccept,
    });
}
