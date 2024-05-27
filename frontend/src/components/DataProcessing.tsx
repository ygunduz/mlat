import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {useAppContext} from "../context/AppContext";
import {useDataTable} from "../hooks/useDataTable";
import {useMemo} from "react";
import {UpdateDataChannel} from "../../wailsjs/go/main/App";
import {Checkbox} from "primereact/checkbox";

export default function DataProcessing() {
    const {dataChannels, toast, setLoading, setContentLoaded} = useAppContext();
    const {filters, scrollHeight, header} = useDataTable();

    const tableData = useMemo(() => {
        const data = [];
        dataChannels.forEach((dataChannel, index) => {
            if (index === 0) {
                data.push({
                    id: 'OverDeterm',
                    [dataChannel.id]: dataChannel.overDetermEnabled,
                })
                data.push({
                    id: 'RefTran',
                    [dataChannel.id]: dataChannel.refTranEnabled,
                })
                data.push({
                    id: 'Height',
                    [dataChannel.id]: dataChannel.heightEnabled,
                })
                dataChannel.items.forEach((item) => {
                    data.push({
                        id: item.receiverId,
                        [dataChannel.id]: item.enabled === 1,
                    })
                })
            } else {
                data[0][dataChannel.id] = dataChannel.overDetermEnabled;
                data[1][dataChannel.id] = dataChannel.refTranEnabled;
                data[2][dataChannel.id] = dataChannel.heightEnabled;
                dataChannel.items.forEach((item, i) => {
                    data[i + 3][dataChannel.id] = item.enabled === 1;
                })
            }
        });
        return data;
    }, [dataChannels]);

    const onRowEditComplete = (e) => {
        setLoading(true);
        const updateData = {
            id: e.newData.id,
            items: Object.keys(e.newData).filter((key) => key !== 'id').map((k) => ({
              key: k,
              value:  e.newData[k]
            }))
        }
        // @ts-ignore
        UpdateDataChannel(updateData).then((data) => {
            setContentLoaded(data);
        }).catch(err => {toast.showError(err); setLoading(false);})
    };

    const cell = (rowData, options) => <Checkbox disabled key={`${rowData.id}${options.field}`} checked={rowData[options.field]}></Checkbox>

    const cellEditor = (options) => <Checkbox checked={options.value === true} onChange={(e) => options.editorCallback(e.checked)} />

    return (
        <div className="card p-fluid">
            <DataTable
                globalFilterFields={['id']} header={header} filters={filters} stripedRows showGridlines
                scrollable scrollHeight={scrollHeight} size={"small"} value={tableData} editMode="row" dataKey="id"
                onRowEditComplete={onRowEditComplete} tableStyle={{minWidth: '50rem'}}>
                <Column field="id" header="Receiver Id" style={{width: '10%'}}></Column>
                {dataChannels.map((dataChannel) =>
                    <Column
                        key={dataChannel.id}
                        field={dataChannel.id}
                        body={cell}
                        editor={cellEditor}
                        header={dataChannel.id}>
                    </Column>)}
                <Column rowEditor headerStyle={{width: '10%', minWidth: '8rem'}} bodyStyle={{textAlign: 'center'}}
                        style={{width: '10%'}}></Column>
            </DataTable>
        </div>
    );
}

