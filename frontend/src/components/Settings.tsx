import {Button} from "primereact/button";
import {useAppContext} from "../context/AppContext";
import {InputNumber} from "primereact/inputnumber";
import {useState} from "react";
import {UpdateSettings} from "../../wailsjs/go/main/App";

export default function Settings() {
    const {settings, toast, setSettings} = useAppContext();
    const [lightSpeed, setLightSpeed] = useState(settings.lightSpeed);

    const saveSettings = () => {
        if (!lightSpeed || lightSpeed <= 0) {
            toast.showError("Light speed must be greater than 0.");
            return;
        }
        UpdateSettings({lightSpeed}).then(() => {
            setSettings({lightSpeed});
            toast.showSuccess("Settings saved.");
        }).catch(err => {
            toast.showError(err);
        })
    }

    return (<div className="flex align-items-center justify-content-center h-30rem">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
            <div className="text-center mb-5">
                <div className="text-900 text-3xl font-medium mb-3">Application Settings</div>
            </div>

            <div className="text-left">
                <div className="p-inputgroup mb-3">
                    <span className="p-inputgroup-addon">Light Speed</span>
                    <InputNumber placeholder="Light Speed" useGrouping={false} value={lightSpeed} minFractionDigits={2}
                                 maxFractionDigits={10} locale="en-US" onValueChange={(e) => setLightSpeed(e.value)}/>
                    <span className="p-inputgroup-addon">m/s</span>
                </div>
                <Button onClick={saveSettings} label="Save" icon="pi pi-save" className="w-full"/>
            </div>
        </div>
    </div>)
}
