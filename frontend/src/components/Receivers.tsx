import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {useAppContext} from "../context/AppContext";
import {useEffect, useState} from "react";
import {FilterMatchMode} from "primereact/api";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {useResizeListener} from "primereact/hooks";

export default function Receivers() {
    const { receivers } = useAppContext();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [scrollHeight, setScrollHeight] = useState(window.innerHeight - 110 + 'px');
    const [bindWindowResizeListener, unbindWindowResizeListener] = useResizeListener({
        listener: (event) => {
            // @ts-ignore
            setScrollHeight(event.currentTarget.innerHeight - 110 + 'px');
        }
    });

    useEffect(() => {
        bindWindowResizeListener();

        return () => {
            unbindWindowResizeListener();
        };
    }, [bindWindowResizeListener, unbindWindowResizeListener]);

    const onRowEditComplete = (e) => {
        // let _products = [...products];
        // let { newData, index } = e;
        //
        // _products[index] = newData;
        //
        // setProducts(_products);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText style={{ height: '35px' }} value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search" />
                </span>
            </div>
        );
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const header = renderHeader();

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
                <Column field="id" header="Receiver Id" editor={(options) => textEditor(options)} style={{width: '10%'}}></Column>
                <Column field="siteId" header="Site Id" editor={(options) => textEditor(options)}></Column>
                <Column field="site.description" header="Description" editor={(options) => textEditor(options)}></Column>
                <Column field="site.latitude" header="Latitude" editor={(options) => textEditor(options)}></Column>
                <Column field="site.longitude" header="Longitude" editor={(options) => textEditor(options)}></Column>
                <Column field="site.height" header="Height" editor={(options) => textEditor(options)}></Column>
                <Column field="addDelaySSRA" header="A" editor={(options) => textEditor(options)}></Column>
                <Column field="addDelaySSRB" header="B" editor={(options) => textEditor(options)}></Column>
                <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
            </DataTable>
        </div>
    );
}

