import {useAppContext} from "../context/AppContext";
import {useDataTable} from "../hooks/useDataTable";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {MultiSelect} from "primereact/multiselect";
import {UpdateTransmitter, UpdateTransponder} from "../../wailsjs/go/main/App";
import {useMemo} from "react";

interface TransmitterTransponderProps {
    type: 'transmitter' | 'transponder'
}

export default function TransmitterTransponder(props: TransmitterTransponderProps) {
    const { transmitters, transponders, toast, receivers, setLoading, setContentLoaded } = useAppContext();
    const { filters, scrollHeight, numberEditor, header } = useDataTable();

    const data = useMemo(() => props.type === 'transmitter' ? transmitters : transponders, [props.type, transmitters, transponders]);

    const onRowEditComplete = (e) => {
        setLoading(true);
        const { newData } = e;
        const updateData = {
            id: newData.id,
            siteId: newData.siteId,
            coveredReceivers: newData.coveredReceivers,
            site: {
                id: newData.site.id,
                description: newData.site.description,
                latitude: newData['site.latitude'] || newData.site.latitude,
                longitude: newData['site.longitude'] || newData.site.longitude,
                height: newData['site.height'] || newData.site.height,
            }
        }
        const updateMethod = props.type === 'transmitter' ? UpdateTransmitter : UpdateTransponder;
        // @ts-ignore
        updateMethod(updateData).then((data) => {
            setContentLoaded(data);
        }).catch(err => {toast.showError(err); setLoading(false);})
    };

    const coveredReceivers = (rowData) => {
        return rowData.coveredReceivers.split(', ').map((receiverId) => {
            return (
                <Tag style={{ height:'20px', marginRight: '1px', marginBottom: '1px'}} key={receiverId} value={receiverId} severity="danger"></Tag>
            )
        })
    }

    const multiSelectEditor = (options) => {
        const coveredReceivers = options.rowData.coveredReceivers.split(', ');
        const optionsReceivers = receivers.map((receiver) => receiver.id);
        return (
            <MultiSelect filter value={coveredReceivers} maxSelectedLabels={4} options={optionsReceivers} onChange={(e) => {
                options.editorCallback(e.value.sort().join(', '))
            }} />
        )
    }

    return (
        <div className="card p-fluid">
            <DataTable
                globalFilterFields={['id', 'siteId']} header={header} filters={filters} stripedRows showGridlines
                scrollable scrollHeight={scrollHeight} size={"small"} value={data} editMode="row" dataKey="id"
                onRowEditComplete={onRowEditComplete} tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header={`${props.type.charAt(0).toUpperCase() + props.type.slice(1)} Id`} style={{width: '12%'}}></Column>
                <Column field="siteId" header="Site Id" style={{width: '10%'}}></Column>
                <Column field="modeSAddress" header="ModeS Address" style={{width: '10%'}}></Column>
                <Column field="site.description" header="Description" style={{width: '10%'}}></Column>
                <Column field="site.latitude" header="Latitude" editor={(options) => numberEditor(options)} style={{width: '10%'}}></Column>
                <Column field="site.longitude" header="Longitude" editor={(options) => numberEditor(options)} style={{width: '10%'}}></Column>
                <Column field="site.height" header="Height" editor={(options) => numberEditor(options)} style={{width: '10%'}}></Column>
                <Column field="coveredReceivers" body={coveredReceivers} header="Covered Receivers" editor={(options) => multiSelectEditor(options)} ></Column>
                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} style={{width: '10%'}}></Column>
            </DataTable>
        </div>
    )
}
