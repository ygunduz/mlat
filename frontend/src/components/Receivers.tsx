import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {useAppContext} from "../context/AppContext";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {UpdateReceiver} from "../../wailsjs/go/main/App";
import {useDataTable} from "../hooks/useDataTable";
import {Dropdown} from "primereact/dropdown";

const delayTemplateA = (rowData) => {
    return rowData.addDelaySSRA;
}

const delayTemplateB = (rowData) => {
    return rowData.addDelaySSRB;
}

export default function Receivers() {
    const { receivers, areas, toast, setLoading, setContentLoaded, sameLocationReceivers } = useAppContext();
    const { filters, scrollHeight, numberEditor, header } = useDataTable();

    const onRowEditComplete = (e) => {
        setLoading(true);
        const { newData } = e;
        const updateData = {
            id: newData.id,
            siteId: newData.siteId,
            addDelaySSRA: newData.addDelaySSRA,
            addDelaySSRB: newData.addDelaySSRB,
            cableLengthA: newData.cableLengthA,
            cableLengthB: newData.cableLengthB,
            disabledAreaId: newData.disabledAreaId || null,
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
            toast.showSuccess('Receiver updated successfully');
            setContentLoaded(data);
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        })
    };

    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="" colSpan={7}/>
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
                <Column header="Disabled Area"/>
                <Column header="A"/>
                <Column header="B"/>
                <Column header=""/>
            </Row>
        </ColumnGroup>)

    const rowClass = (data) => {
        return {
            'bg-red-100': sameLocationReceivers.includes(data.id)
        };
    };

    const areaEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={areas.map(a => a.id)}
                onChange={(e) => options.editorCallback(e.value)}
                showClear={true}
                placeholder="Select"
            />
        );
    };

    return (
        <div className="card p-fluid">
            <DataTable
                globalFilterFields={['id', 'siteId']} header={header} filters={filters} stripedRows headerColumnGroup={headerGroup} showGridlines
                scrollable scrollHeight={scrollHeight} size={"small"} value={receivers} editMode="row" dataKey="id" onRowEditComplete={onRowEditComplete}
                tableStyle={{ minWidth: '50rem' }} rowClassName={rowClass}>
                <Column field="id" header="Receiver Id" style={{width: '10%'}}></Column>
                <Column field="siteId" header="Site Id" style={{width: '10%'}}></Column>
                <Column field="site.description" header="Description"></Column>
                <Column field="site.latitude" header="Latitude" editor={(options) => numberEditor(options)}></Column>
                <Column field="site.longitude" header="Longitude" editor={(options) => numberEditor(options)}></Column>
                <Column field="site.height" header="Height" editor={(options) => numberEditor(options)}></Column>
                <Column field="disabledAreaId" header="Disable Area" editor={(options) => areaEditor(options)}></Column>
                <Column field="cableLengthA" body={delayTemplateA} header="A" editor={(options) => numberEditor(options)}></Column>
                <Column field="cableLengthB" body={delayTemplateB} header="B" editor={(options) => numberEditor(options)}></Column>
                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }} style={{width: '10%'}}></Column>
            </DataTable>
        </div>
    );
}

