import {Accordion, AccordionTab} from "primereact/accordion";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {main} from "../../wailsjs/go/models";
import Receiver = main.Receiver;
import Transponder = main.Transponder;
import Transmitter = main.Transmitter;
import {AreaType} from "../helpers/AreaHelpers";

interface IMapPanelProps {
    receivers: Receiver[] | undefined,
    transmitters: Transmitter[] | undefined,
    transponders: Transponder[] | undefined,
    areas: AreaType[] | undefined,
    selectedTransmitters: Transmitter[] | undefined,
    selectedTransponders: Transponder[] | undefined,
    selectedReceivers: Receiver[] | undefined,
    selectedAreas: AreaType[] | undefined,
    setSelectedReceivers: (receivers: Receiver[]) => void,
    setSelectedTransmitters: (transmitters: Transmitter[]) => void,
    setSelectedTransponders: (transponders: Transponder[]) => void,
    setSelectedAreas: (areas: AreaType[]) => void,
}

export default function MapPanel(props: IMapPanelProps) {
    const {
        receivers,
        transmitters,
        transponders,
        areas,
        selectedTransmitters,
        selectedTransponders,
        selectedAreas,
        selectedReceivers,
        setSelectedReceivers,
        setSelectedTransmitters,
        setSelectedTransponders,
        setSelectedAreas
    } = props;

    const areaBodyTemplate = (rowData: AreaType) => {
        return <div className="align-content-between flex flex-row">
            <div className="mt-1 mr-2" style={{width: '15px', height: '15px', backgroundColor: rowData.color}}/>
            <div>{rowData.id}</div>
        </div>
    }

    return <Accordion activeIndex={0}>
        <AccordionTab header="Receivers">
            <DataTable value={receivers} selectionMode='multiple'
                       selection={selectedReceivers}
                       size="small"
                       scrollHeight={'350px'}
                       onSelectionChange={(e) => {
                           setSelectedTransmitters([]);
                           setSelectedTransponders([]);
                           // @ts-ignore
                           setSelectedReceivers(e.value);
                       }}
                       dataKey="id" tableStyle={{maxWidth: '250px'}}>
                <Column selectionMode="multiple" headerStyle={{width: '2rem'}} style={{width: 20}}></Column>
                <Column field="id" header="Receiver Id" style={{width: 150}}></Column>
            </DataTable>
        </AccordionTab>
        <AccordionTab header="Transmitters">
            <DataTable value={transmitters} selectionMode='radiobutton'
                       selection={selectedTransmitters}
                       size="small"
                       scrollHeight={'350px'}
                       onSelectionChange={(e) => {
                           // @ts-ignore
                           setSelectedTransmitters(e.value)
                           setSelectedTransponders([]);
                           if(e.value) {
                               // @ts-ignore
                               const rs = e.value.coveredReceivers.split(', ')
                               const selected = receivers?.filter(r => rs.includes(r.id));
                               setSelectedReceivers(selected || []);
                           } else {
                               setSelectedReceivers([]);
                           }
                       }}
                       dataKey="id" tableStyle={{maxWidth: '250px'}}>
                <Column selectionMode="single" headerStyle={{width: '2rem'}} style={{width: 20}}></Column>
                <Column field="id" header="Transmitter Id" style={{width: 150}}></Column>
            </DataTable>
        </AccordionTab>
        <AccordionTab header="Transponders">
            <DataTable value={transponders} selectionMode='radiobutton'
                       selection={selectedTransponders}
                       scrollHeight={'350px'}
                       onSelectionChange={(e) => {
                           // @ts-ignore
                           setSelectedTransponders(e.value)
                           setSelectedTransmitters([]);
                           if(e.value) {
                               // @ts-ignore
                               const rs = e.value.coveredReceivers.split(', ')
                               const selected = receivers?.filter(r => rs.includes(r.id));
                               setSelectedReceivers(selected || []);
                           } else {
                               setSelectedReceivers([]);
                           }
                       }}
                       dataKey="id" tableStyle={{maxWidth: '250px'}}>
                <Column selectionMode="single" headerStyle={{width: '2rem'}} style={{width: 20}}></Column>
                <Column field="id" header="Transponder Id" style={{width: 150}}></Column>
            </DataTable>
        </AccordionTab>
        <AccordionTab header="Areas">
            <DataTable value={areas} selectionMode='checkbox'
                       selection={selectedAreas}
                       scrollHeight={'350px'}
                       onSelectionChange={(e) => {
                           // @ts-ignore
                           setSelectedAreas(e.value)
                       }}
                       dataKey="id" tableStyle={{maxWidth: '250px'}}>
                <Column selectionMode="multiple" headerStyle={{width: '2rem'}} style={{width: 20}}></Column>
                <Column field="id" header="Area Id" style={{width: 150}} body={areaBodyTemplate}></Column>
            </DataTable>
        </AccordionTab>
    </Accordion>
}
