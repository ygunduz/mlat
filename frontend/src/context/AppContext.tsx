import {createContext, useContext, useReducer, ReactNode, useRef, useMemo, useEffect, forwardRef} from "react";
import {Toast as PRToast} from "primereact/toast";
import {Toast} from "../helpers/Toast";
import {main} from "../../wailsjs/go/models";
import {GetSettings} from "../../wailsjs/go/main/App";
import Container = main.Container;
import Site = main.Site;
import Receiver = main.Receiver;
import Transmitter = main.Transmitter;
import Transponder = main.Transponder;
import Settings = main.Settings;
import DataChannel = main.DataChannel;

interface IAppContext {
    loading: boolean,
    contentLoaded: boolean,
    setLoading: (loading: boolean) => void,
    setContentLoaded: (container: Container) => string[],
    receivers: Receiver[] | undefined,
    sameLocationReceivers: string[] | undefined,
    transmitters: Transmitter[] | undefined,
    transponders: Transponder[] | undefined,
    sites: Site[] | undefined,
    dataChannels: DataChannel[] | undefined,
    settings: Settings | undefined,
    setSettings: (settings: Settings) => void,
    toast: Toast
}

const AppContext = createContext<IAppContext | null>(null)

interface AppProviderProps {
    children: ReactNode,
    toast: Toast
}

const findSameLocationReceivers = (receivers: Receiver[]) => {
    const sameLocationReceivers: string[] = [];
    receivers.forEach(receiver => {
        const sameLocationReceiver = receivers.find(r =>
            r.site.latitude === receiver.site.latitude &&
            r.site.longitude === receiver.site.longitude &&
            r.id !== receiver.id);
        if (sameLocationReceiver) {
            sameLocationReceivers.push(receiver.id);
        }
    });
    return sameLocationReceivers;
}

export const AppProvider = ({children, toast}: AppProviderProps) => {
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
        const receivers = findSameLocationReceivers(container.receivers);
        updateValue({
            contentLoaded: true,
            loading: false,
            receivers: container.receivers,
            transmitters: container.transmitters,
            transponders: container.transponders,
            sameLocationReceivers: receivers,
            sites: container.sites,
            dataChannels: container.dataChannels
        });
        return receivers;
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
            sameLocationReceivers: values.sameLocationReceivers,
            setContentLoaded,
            setLoading,
            setSettings,
            toast
        }}>
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
