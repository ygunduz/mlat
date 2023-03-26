import {createContext, ReactNode, useContext, useEffect, useReducer} from "react";
import {Toast} from "../helpers/Toast";
import {main} from "../../wailsjs/go/models";
import {GetSettings} from "../../wailsjs/go/main/App";
import {AreaType} from "../helpers/AreaHelpers";
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
    toast: Toast,
    areas: Array<AreaType | null> | undefined,
    setAreas: (areas: Array<AreaType | null> | undefined) => void
    ignoredReceivers: string[],
    transmitterHasReceiver: string[],
    transponderHasReceiver: string[],
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

const receiverTransmitterSameLocation = (receiver: Receiver[], transmitter: Transmitter[]) => {
    const sameLocationReceivers: string[] = [];
    receiver.forEach(r => {
        const sameLocationReceiver = transmitter.find(t =>
            t.site.latitude === r.site.latitude &&
            t.site.longitude === r.site.longitude);
        if (sameLocationReceiver) {
            sameLocationReceivers.push(r.id);
        }
    });
    return sameLocationReceivers;
}

const receiverTransponderSameLocation = (receiver: Receiver[], transponder: Transponder[]) => {
    const sameLocationReceivers: string[] = [];
    receiver.forEach(r => {
        const sameLocationReceiver = transponder.find(t =>
            t.site.latitude === r.site.latitude &&
            t.site.longitude === r.site.longitude);
        if (sameLocationReceiver) {
            sameLocationReceivers.push(r.id);
        }
    });
    return sameLocationReceivers;
}

const transponderReceiverSameLocation = (transponder: Transponder[], receiver: Receiver[]) => {
    const sameLocationTransponders: string[] = [];
    transponder.forEach(r => {
        const sameLocationReceiver = receiver.find(t =>
            t.site.latitude === r.site.latitude &&
            t.site.longitude === r.site.longitude);
        if (sameLocationReceiver) {
            sameLocationTransponders.push(r.id);
        }
    });
    return sameLocationTransponders;
}

const transmitterReceiverSameLocation = (transmitter: Transmitter[], receiver: Receiver[]) => {
    const sameLocationTransmitters: string[] = [];
    transmitter.forEach(r => {
        const sameLocationReceiver = receiver.find(t =>
            t.site.latitude === r.site.latitude &&
            t.site.longitude === r.site.longitude);
        if (sameLocationReceiver) {
            sameLocationTransmitters.push(r.id);
        }
    });
    return sameLocationTransmitters;
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

    const setAreas = (areas: Array<AreaType | null> | undefined) => {
        updateValue({areas, loading: false});
    }

    const setSettings = (settings: Settings) => {
        updateValue({settings, loading: false});
    }

    const setContentLoaded = (container: Container) => {
        const receivers = findSameLocationReceivers(container.receivers);
        const igrnoredReceivers = [...receiverTransponderSameLocation(container.receivers, container.transponders),
            ...receiverTransmitterSameLocation(container.receivers, container.transmitters)];
        const transmitterHasReceiver = transmitterReceiverSameLocation(container.transmitters, container.receivers);
        const transponderHasReceiver = transponderReceiverSameLocation(container.transponders, container.receivers);
        updateValue({
            contentLoaded: true,
            loading: false,
            receivers: container.receivers,
            transmitters: container.transmitters,
            transponders: container.transponders,
            sameLocationReceivers: receivers,
            sites: container.sites,
            dataChannels: container.dataChannels,
            ignoredReceivers: igrnoredReceivers,
            transmitterHasReceiver,
            transponderHasReceiver
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
            areas: values.areas,
            ignoredReceivers: values.ignoredReceivers,
            transmitterHasReceiver: values.transmitterHasReceiver,
            transponderHasReceiver: values.transponderHasReceiver,
            setContentLoaded,
            setLoading,
            setSettings,
            setAreas,
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
