import {createContext, useContext, useReducer, ReactNode, useRef, RefObject, useMemo} from "react";
import {Toast as PRToast} from "primereact/toast";
import {Toast} from "../helpers/Toast";
import {main} from "../../wailsjs/go/models";
import Container = main.Container;
import Site = main.Site;
import Receiver = main.Site;
import Transmitter = main.Site;
import Transponder = main.Site;

interface IAppContext {
    loading: boolean,
    contentLoaded: boolean,
    setLoading: (loading: boolean) => void,
    setContentLoaded: (container: Container) => void,
    receivers: Receiver[] | undefined,
    transmitters: Transmitter[] | undefined,
    transponders: Transponder[] | undefined,
    sites: Site[] | undefined,
    toast: Toast
}

const AppContext = createContext<IAppContext | null>(null)

interface IyzicoProviderProps {
    children: ReactNode,
}

export const AppProvider = ({children}: IyzicoProviderProps) => {
    const ref = useRef<PRToast>();
    const toast = useMemo(() => new Toast(ref), [ref]);
    const [values, updateValue] = useReducer(
        (prev: any, next: any) => {
            return {...prev, ...next};
        },
        {loading: false, contentLoaded: false}
    );

    const setLoading = (loading: boolean) => {
        updateValue({loading});
    }

    const setContentLoaded = (container: Container) => {
        updateValue({
            contentLoaded: true,
            loading: false,
            receivers: container.receivers,
            transmitters: container.transmitters,
            transponders: container.transponders,
            sites: container.sites
        });
    }

    return (
        <AppContext.Provider value={{
            loading: values.loading,
            contentLoaded: values.contentLoaded,
            receivers: values.receivers,
            transmitters: values.transmitters,
            transponders: values.transponders,
            sites: values.sites,
            setContentLoaded,
            setLoading,
            toast
        }}>
            <PRToast ref={ref}/>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useIyzico must be used within a IyzicoProvider");
    }
    return context;
}
