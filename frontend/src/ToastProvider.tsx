import {Fragment, useMemo, useRef} from "react";
import {Toast} from "./helpers/Toast";
import {Toast as PRToast} from "primereact/toast";
import {AppProvider} from "./context/AppContext";

export default function ToastProvider({children}) {
    const ref = useRef(null);
    const toast = useMemo(() => new Toast(ref), [ref]);

    return (
        <Fragment>
            <PRToast ref={ref} baseZIndex={1001}/>
            <AppProvider toast={toast}>
                {children}
            </AppProvider>
        </Fragment>
    )
}
