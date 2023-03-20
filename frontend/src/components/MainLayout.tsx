import Receivers from "./Receivers";
import TransmitterTransponder from "./TransmitterTransponder";
import {TabPanel, TabView} from "primereact/tabview";
import {useMemo} from "react";
import ReceiverIcon from "../icons/ReceiverIcon";
import TransmitterIcon from "../icons/TransmitterIcon";
import TransponderIcon from "../icons/TransponderIcon";
import Settings from "./Settings";
import DataProcessing from "./DataProcessing";

export const MainLayout = () => {

    const headers = useMemo(() => {
        return {
            Receivers: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <ReceiverIcon size={16} selected={options.selected} className="pi mr-2"/>
                <span className="p-tabview-title">Receivers</span>
            </a>,
            Transmitters: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <TransmitterIcon size={16} selected={options.selected} className="pi mr-2"/>
                <span className="p-tabview-title">Transmitters</span>
            </a>,
            Transponders: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <TransponderIcon size={16} selected={options.selected} className="pi mr-2"/>
                <span className="p-tabview-title">Transponders</span>
            </a>,
            DataProcessing: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <i className="pi pi-forward mr-2"></i>
                <span className="p-tabview-title">Data Processing</span>
                </a>,
            Map: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <i className="pi pi-globe mr-2"></i>
                <span className="p-tabview-title">Map</span>
            </a>,
            Settings: (options) => <a role="tab" className="p-tabview-nav-link" onClick={options.onClick}>
                <i className="pi pi-cog mr-2"></i>
                <span className="p-tabview-title">Settings</span>
            </a>
        }
    }, []);

    return (
        <TabView>
            <TabPanel header="Receivers" headerTemplate={headers.Receivers}>
                <Receivers />
            </TabPanel>
            <TabPanel header="TransmitterTransponder" headerTemplate={headers.Transmitters}>
                <TransmitterTransponder type="transmitter" />
            </TabPanel>
            <TabPanel header="Transponders" headerTemplate={headers.Transponders}>
                <TransmitterTransponder type="transponder" />
            </TabPanel>
            <TabPanel header="Data Processing" headerTemplate={headers.DataProcessing}>
                <DataProcessing/>
            </TabPanel>
            <TabPanel header="Map" headerTemplate={headers.Map}>
                <Receivers/>
            </TabPanel>
            <TabPanel header="Settings" headerTemplate={headers.Settings}>
                <Settings/>
            </TabPanel>
        </TabView>
    )
};
