import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {useAppContext} from "../context/AppContext";
import {UpdateChannel} from "../../wailsjs/go/main/App";
import {useDataTable} from "../hooks/useDataTable";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";

export default function Channels() {
    const { channels, toast, setLoading, setContentLoaded } = useAppContext();
    const { filters, scrollHeight, header } = useDataTable();

    const onRowEditComplete = (e) => {
        setLoading(true);
        // @ts-ignore
        UpdateChannel(e.newData).then((data) => {
            toast.showSuccess('Channel updated successfully');
            setContentLoaded(data);
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        })
    };

    const textEditor = (options) => {
        return <InputText style={{height: '35px'}} value={options.value} onChange={(e) => options.editorCallback(e.target.value)}/>;
    };

    const numberEditor = (options) => {
        return <InputNumber style={{height: '35px'}} value={options.value} minFractionDigits={0}
                            maxFractionDigits={0} useGrouping={false}
                            onChange={(e) => options.editorCallback(e.value)}/>;
    };

    return (
        <div className="card p-fluid">
            <DataTable
                globalFilterFields={['id', 'siteId']} header={header} filters={filters} stripedRows showGridlines scrollable scrollHeight={scrollHeight}
                size={"small"} value={channels} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="Channel Id" style={{width: '10%'}}></Column>
                <Column field="name" header="Name" style={{width: '40%'}}></Column>
                <Column field="multicastIp" header="Multicast IP" editor={(o) => textEditor(o)}></Column>
                <Column field="port" header="Port" editor={(options) => numberEditor(options)}></Column>
                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} style={{width: '10%'}}></Column>
            </DataTable>
        </div>
    );
}

