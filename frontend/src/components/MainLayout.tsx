import Receivers from "./Receivers";
import {TabPanel, TabView} from "primereact/tabview";

export const MainLayout = () => {

    const items = [
        {label: 'Receivers', icon: 'pi pi-fw pi-home'},
        {label: 'Transmitters', icon: 'pi pi-fw pi-calendar'},
        {label: 'Transponders', icon: 'pi pi-fw pi-pencil'},
        {label: 'Data Processing', icon: 'pi pi-fw pi-file'},
        {label: 'Map', icon: 'pi pi-fw pi-file'},
        {label: 'Settings', icon: 'pi pi-fw pi-cog'}
    ];

    return (
        <TabView>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Receivers">
                <Receivers/>
            </TabPanel>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Transmitters">
                <Receivers/>
            </TabPanel>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Transponders">
                <Receivers/>
            </TabPanel>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Data Processing">
                <Receivers/>
            </TabPanel>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Map">
                <Receivers/>
            </TabPanel>
            <TabPanel leftIcon="pi pi-calendar mr-2" header="Settings">
                <Receivers/>
            </TabPanel>
        </TabView>
    )
};
