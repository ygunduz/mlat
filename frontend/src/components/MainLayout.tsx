import {Fragment} from "react";
import {Toolbar} from "primereact/toolbar";
import {Button} from "primereact/button";
import {ToggleButton} from "primereact/togglebutton";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {ReloadData} from "../../wailsjs/go/main/App";
import {useAppContext} from "../context/AppContext";

export const MainLayout = () => {
    const {setContentLoaded, setLoading, toast} = useAppContext();
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const reloadData = () => {
        setLoading(true);
        ReloadData().then(data => {
            const same = setContentLoaded(data);
            if (same && same.length > 0) {
                toast.showWarn(`Receivers ${same.join(', ')} are in the same location. Please check the data.`)
            }
        }).catch(err => {
            toast.showError(err);
        });
    }

    const startContent = (
        <Fragment>
            <ToggleButton onLabel="Receivers" offLabel="Receivers" onChange={() => navigate('/receivers')}
                          checked={pathname === '/receivers'} className="mr-2"/>
            <ToggleButton onLabel="Transmitters" offLabel="Transmitters" onChange={() => navigate('/transmitters')}
                          checked={pathname === '/transmitters'} className="mr-2"/>
            <ToggleButton onLabel="Transponders" offLabel="Transponders" onChange={() => navigate('/transponders')}
                          checked={pathname === '/transponders'} className="mr-2"/>
            <ToggleButton onLabel="Data Processing" offLabel="Data Processing" onChange={() => navigate('/data-processing')}
                          checked={pathname === '/data-processing'} className="mr-2"/>
            <ToggleButton onLabel="Channels" offLabel="Channels" onChange={() => navigate('/channels')}
                          checked={pathname === '/channels'} className="mr-2"/>
        </Fragment>
    );

    const endContent = (
        <Fragment>
            <Button icon="pi pi-cog" className="p-button-danger mr-2" onClick={() => navigate('/settings')}/>
            <Button icon="pi pi-globe" className="p-button-success mr-2" onClick={() => navigate('/map')}/>
            <Button icon="pi pi-refresh" className="p-button-info" onClick={reloadData}/>
        </Fragment>
    );

    return (
        <Fragment>
            <Toolbar style={{height: '50px', paddingTop: '5px'}} start={startContent} end={endContent}/>
            <main>
                <Outlet/>
            </main>
        </Fragment>
    )
};
