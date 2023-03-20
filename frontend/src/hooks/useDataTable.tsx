import {useEffect, useMemo, useState} from "react";
import {FilterMatchMode} from "primereact/api";
import {useResizeListener} from "primereact/hooks";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";

export const useDataTable = () => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [scrollHeight, setScrollHeight] = useState(window.innerHeight - 106 + 'px');
    const [bindWindowResizeListener, unbindWindowResizeListener] = useResizeListener({
        listener: (event) => {
            // @ts-ignore
            setScrollHeight(event.currentTarget.innerHeight - 106 + 'px');
        }
    });

    useEffect(() => {
        bindWindowResizeListener();

        return () => {
            unbindWindowResizeListener();
        };
    }, [bindWindowResizeListener, unbindWindowResizeListener]);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText style={{height: '35px'}} value={globalFilterValue} onChange={onGlobalFilterChange}
                               placeholder="Search"/>
                </span>
            </div>
        );
    };

    const numberEditor = (options) => {
        return <InputNumber style={{height: '35px'}} value={options.value} minFractionDigits={2}
                            maxFractionDigits={10} locale="en-US"
                            onChange={(e) => options.editorCallback(e.value)}/>;
    };

    const header = useMemo(() => renderHeader(), [globalFilterValue, onGlobalFilterChange]);

    return {filters, scrollHeight, numberEditor, header};
}
