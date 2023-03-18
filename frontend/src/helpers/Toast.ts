import {RefObject} from "react";
import {Toast as PRToast} from "primereact/toast";

export class Toast {
    private toast: RefObject<PRToast>;
    constructor(toast: RefObject<PRToast>) {
        this.toast = toast;
    }

    public showSuccess(message: string) {
        this.toast.current.show({severity: 'success', summary: 'Success', detail: message, life: 3000});
    }

    public showError(message: string) {
        this.toast.current.show({severity: 'error', summary: 'Error', detail: message, life: 3000});
    }

    public showInfo(message: string) {
        this.toast.current.show({severity: 'info', summary: 'Info', detail: message, life: 3000});
    }

    public showWarn(message: string) {
        this.toast.current.show({severity: 'warn', summary: 'Warn', detail: message, life: 3000});
    }
}
