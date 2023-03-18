import {ProgressSpinner} from "primereact/progressspinner";
import {BlockUI} from "primereact/blockui";
import {SelectFile} from "../wailsjs/go/main/App";
import {useAppContext} from "./context/AppContext";
import {Button} from "primereact/button";
import {MainLayout} from "./components/MainLayout";

function App() {
    const {loading, setLoading, toast, setContentLoaded, contentLoaded} = useAppContext();

    function selectFile() {
        setLoading(true);
        SelectFile().then((result) => {
            setContentLoaded(result);
        }).catch(err => {
            toast.showError(err)
            setLoading(false);
        });
    }

    return (
        <BlockUI blocked={loading} template={<ProgressSpinner/>} fullScreen>
            {contentLoaded ? <MainLayout/> : <div className="grid" style={{width: '100%', marginTop: '45vh'}}>
                <div className="col-6 col-offset-3">
                    <div className="text-center mb-2 text-xl">İşlem Yapabilmek İçin Lütfen Önce Dosya Seçiniz!</div>
                    <div className="col-6 col-offset-3 text-center">
                        <Button label="Dosya Seç" icon="pi pi-file" onClick={selectFile}/>
                    </div>
                </div>
            </div>}
        </BlockUI>
    )
}

export default App
