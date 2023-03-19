import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {useAppContext} from "../context/AppContext";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {UpdateReceiver} from "../../wailsjs/go/main/App";
import {useDataTable} from "../hooks/useDataTable";

export default function Receivers() {
    const { receivers, toast, setLoading, setContentLoaded } = useAppContext();
    const { filters, scrollHeight, numberEditor, header } = useDataTable();

    const onRowEditComplete = (e) => {
        setLoading(true);
        const { newData } = e;
        const updateData = {
            id: newData.id,
            siteId: newData.siteId,
            addDelaySSRA: newData.addDelaySSRA,
            addDelaySSRB: newData.addDelaySSRB,
            site: {
                id: newData.site.id,
                description: newData.site.description,
                latitude: newData['site.latitude'] || newData.site.latitude,
                longitude: newData['site.longitude'] || newData.site.longitude,
                height: newData['site.height'] || newData.site.height,
            }
        }
        // @ts-ignore
        UpdateReceiver(updateData).then((data) => {
            setContentLoaded(data);
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        })
    };

    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="" colSpan={6}/>
                <Column header="Add Delay SSR" colSpan={2}/>
                <Column header=""/>
            </Row>
            <Row>
                <Column header="Receiver Id"/>
                <Column header="Site Id"/>
                <Column header="Description"/>
                <Column header="Latitude"/>
                <Column header="Longitude"/>
                <Column header="Height"/>
                <Column header="A"/>
                <Column header="B"/>
                <Column header=""/>
            </Row>
        </ColumnGroup>)

    return (
        <div className="card p-fluid">
            <DataTable
                globalFilterFields={['id', 'siteId']} header={header} filters={filters} stripedRows headerColumnGroup={headerGroup} showGridlines
                scrollable scrollHeight={scrollHeight} size={"small"} value={receivers} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete}
                tableStyle={{ minWidth: '50rem' }}>
                <Column field="id" header="Receiver Id" style={{width: '10%'}}></Column>
                <Column field="siteId" header="Site Id" style={{width: '10%'}}></Column>
                <Column field="site.description" header="Description"></Column>
                <Column field="site.latitude" header="Latitude" editor={(options) => numberEditor(options)}></Column>
                <Column field="site.longitude" header="Longitude" editor={(options) => numberEditor(options)}></Column>
                <Column field="site.height" header="Height" editor={(options) => numberEditor(options)}></Column>
                <Column field="addDelaySSRA" header="A" editor={(options) => numberEditor(options)}></Column>
                <Column field="addDelaySSRB" header="B" editor={(options) => numberEditor(options)}></Column>
                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} style={{width: '10%'}}></Column>
            </DataTable>
        </div>
    );
}

