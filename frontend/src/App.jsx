import {ProgressSpinner} from "primereact/progressspinner";
import {BlockUI} from "primereact/blockui";
import {useAppContext} from "./context/AppContext";
import {Fragment} from "react";
import {HashRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import {MainLayout} from "./components/MainLayout";
import Receivers from "./components/Receivers";
import TransmitterTransponder from "./components/TransmitterTransponder";
import DataProcessing from "./components/DataProcessing";
import Map from "./components/Map";
import Channels from "./components/Channels";

function App() {
    const { loading } = useAppContext()

    return (
        <Fragment>
            <BlockUI blocked={loading} template={<ProgressSpinner/>} fullScreen />
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} exact />
                    <Route element={<MainLayout />}>
                        <Route path="/receivers" element={<Receivers />} />
                        <Route path="/transmitters" element={<TransmitterTransponder type="transmitter" />} />
                        <Route path="/transponders" element={<TransmitterTransponder type="transponder" />} />
                        <Route path="/data-processing" element={<DataProcessing />} />
                        <Route path="/channels" element={<Channels />} />
                        {/*<Route path="/settings" element={<Settings />} />*/}
                    </Route>
                    <Route path="/map" element={<Map />} />
                </Routes>
            </HashRouter>
        </Fragment>
    )
}

export default App
