import {TabMenu} from "primereact/tabmenu";
import {useState} from "react";
import Receivers from "./Receivers";
import {TabPanel, TabView} from "primereact/tabview";

export const MainLayout = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const items = [
        {label: 'Receivers', icon: 'pi pi-fw pi-home'},
        {label: 'Transmitters', icon: 'pi pi-fw pi-calendar'},
        {label: 'Transponders', icon: 'pi pi-fw pi-pencil'},
        {label: 'Data Processing', icon: 'pi pi-fw pi-file'},
        {label: 'Map', icon: 'pi pi-fw pi-file'},
        {label: 'Settings', icon: 'pi pi-fw pi-cog'}
    ];

    const getMenuItem = () => {
        if (activeIndex === 0) return (<Receivers/>);
        if (activeIndex === 1) return (<div>Transmitters</div>);
        if (activeIndex === 2) return (<div>Transponders</div>);
        if (activeIndex === 3) return (<div>Data Processing</div>);
        if (activeIndex === 4) return (<div>Map</div>);
        if (activeIndex === 5) return (<div>Settings</div>);
        return null;
    }


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
        // <div className="card">
        //     <TabMenu model={items} activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
        //         {getMenuItem()}
        //     </TabMenu>
        // </div>
    )
};
