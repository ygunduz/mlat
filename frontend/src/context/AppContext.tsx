import {createContext, useContext, useReducer, ReactNode, useRef, useMemo, useEffect} from "react";
import {Toast as PRToast} from "primereact/toast";
import {Toast} from "../helpers/Toast";
import {main} from "../../wailsjs/go/models";
import {GetSettings} from "../../wailsjs/go/main/App";
import Container = main.Container;
import Site = main.Site;
import Receiver = main.Site;
import Transmitter = main.Site;
import Transponder = main.Site;
import Settings = main.Settings;
import DataChannel = main.DataChannel;

interface IAppContext {
    loading: boolean,
    contentLoaded: boolean,
    setLoading: (loading: boolean) => void,
    setContentLoaded: (container: Container) => void,
    receivers: Receiver[] | undefined,
    transmitters: Transmitter[] | undefined,
    transponders: Transponder[] | undefined,
    sites: Site[] | undefined,
    dataChannels: DataChannel[] | undefined,
    settings: Settings | undefined,
    setSettings: (settings: Settings) => void,
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
        {loading: true, contentLoaded: false}
    );

    useEffect(() => {
        GetSettings().then(settings => {
            updateValue({settings, loading: false});
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        });
    }, []);

    const setLoading = (loading: boolean) => {
        updateValue({loading});
    }

    const setSettings = (settings: Settings) => {
        updateValue({settings, loading: false});
    }

    const setContentLoaded = (container: Container) => {
        updateValue({
            contentLoaded: true,
            loading: false,
            receivers: container.receivers,
            transmitters: container.transmitters,
            transponders: container.transponders,
            sites: container.sites,
            dataChannels: container.dataChannels
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
            settings: values.settings,
            dataChannels: values.dataChannels,
            setContentLoaded,
            setLoading,
            setSettings,
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
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
}
