import {Accordion, AccordionTab} from "primereact/accordion";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {main} from "../../wailsjs/go/models";
import Receiver = main.Receiver;
import Transponder = main.Transponder;
import Transmitter = main.Transmitter;

interface IMapPanelProps {
    receivers: Receiver[] | undefined,
    transmitters: Transmitter[] | undefined,
    transponders: Transponder[] | undefined,
    selectedTransmitters: Transmitter[] | undefined,
    selectedTransponders: Transponder[] | undefined,
    setSelectedReceivers: (receivers: Receiver[]) => void,
    setSelectedTransmitters: (transmitters: Transmitter[]) => void,
    setSelectedTransponders: (transponders: Transponder[]) => void,
}

export default function MapPanel(props: IMapPanelProps) {
    const {
        receivers,
        transmitters,
        transponders,
        selectedTransmitters,
        selectedTransponders,
        setSelectedReceivers,
        setSelectedTransmitters,
        setSelectedTransponders
    } = props;

    return <Accordion activeIndex={0}>
        <AccordionTab header="Transmitters">
            <DataTable value={transmitters} selectionMode='radiobutton'
                       selection={selectedTransmitters}
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
    </Accordion>
}
