import {Button} from "primereact/button";
import {useAppContext} from "../context/AppContext";
import {SelectFile} from "../../wailsjs/go/main/App";
import {useNavigate, useRoutes} from "react-router-dom"

export default function Home() {
    const {setLoading, toast, setContentLoaded} = useAppContext();
    const navigate = useNavigate();

    function selectFile() {
        setLoading(true);
        SelectFile().then((result) => {
            const same = setContentLoaded(result);
            if (same) {
                toast.showWarn(`Receivers ${same.join(', ')} are in the same location. Please check the data.`)
            }
            navigate('/receivers');
        }).catch(err => {
            toast.showError(err)
            setLoading(false);
        });
    }
    return <div className="grid" style={{width: '100%', marginTop: '45vh'}}>
        <div className="col-6 col-offset-3">
            <div className="text-center mb-2 text-xl">İşlem Yapabilmek İçin Lütfen Önce Dosya Seçiniz!</div>
            <div className="col-6 col-offset-3 text-center">
                <Button label="Dosya Seç" icon="pi pi-file" onClick={selectFile}/>
            </div>
        </div>
    </div>
}
