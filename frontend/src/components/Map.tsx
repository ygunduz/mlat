import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {OverlayPanel} from "primereact/overlaypanel";
import {useAppContext} from "../context/AppContext";
import {main} from "../../wailsjs/go/models";
import MapPanel from "./MapPanel";
import {ReloadData} from "../../wailsjs/go/main/App";
import Receiver = main.Receiver;
import Transmitter = main.Transmitter;
import Transponder = main.Transponder;
import {useNavigate} from "react-router-dom";
import {AreaType, GetAreas} from "../helpers/AreaHelpers";
import MapLegent from "./MapLegent";
import {copyTextToClipboard} from "../helpers";
import {
    GeoJSON,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    CircleMarker,
    LayersControl,
    LayerGroup,
} from "react-leaflet";
import * as L from "leaflet";

const colors = {
    receiver: 'red',
    transmitter: 'blue',
    transponder: 'green'
}

const icon = (color: string, size: string = undefined) => new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${size ? size + '-' : ''}${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [size ? 40 : 24, size ? 60 : 41],
        iconAnchor: [size ? 20 : 12, size ? 60 : 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
});

const transponderIcon = icon('green', '2x');
const transmitterIcon = icon('blue', '2x');
const receiverIcon = icon('red');

const entityDescription = (entity: Receiver | Transmitter | Transponder) => <Popup><dl>
    <dt>Id: {entity.id}</dt>
    <dt>Site: {entity.site.id}</dt>
    <dt>Description: {entity.site.description}</dt>
    <dt>Latitude: {entity.site.latitude}</dt>
    <dt>Longitude: {entity.site.longitude}</dt>
    <dt>Height: {entity.site.height}</dt>
    {/*@ts-ignore*/}
    {entity.coveredReceivers && <dt>CoveredReceivers: {entity.coveredReceivers}</dt>}
</dl></Popup>

const mapEntity = (entity: Receiver | Transmitter | Transponder, color: string, radius: number, opacity: number) => {
    return <CircleMarker
        key={entity.id}
        center={[entity.site.latitude, entity.site.longitude]} radius={radius} pathOptions={{color:color, fillOpacity: opacity}}>
        {entityDescription(entity)}
    </CircleMarker>
}

export default function Map() {
    const mapRef = useRef(null);
    const positionRef = useRef<string>(null);
    const areaLayerRef = useRef([]);
    const op = useRef(null);
    const navigate = useNavigate();
    const {
        receivers,
        transmitters,
        transponders,
        areas,
        setLoading,
        setContentLoaded,
        setAreas,
        toast
    } = useAppContext();
    const [selectedReceivers, setSelectedReceivers] = useState([] as Array<Receiver>);
    const [selectedTransmitters, setSelectedTransmitters] = useState([] as Array<Transmitter>);
    const [selectedTransponders, setSelectedTransponders] = useState([] as Array<Transponder>);
    const [selectedAreas, setSelectedAreas] = useState([] as Array<AreaType>);

    useEffect(() => {
        setLoading(true);
        GetAreas().then(a => {
            setAreas(a);
        }).catch(e => {
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if(mapRef.current) {
            mapRef.current.pm.addControls({
                position: 'topleft',
                drawCircleMarker: false,
                rotateMode: false,
            })
            mapRef.current.on("pm:drawend", ({ workingLayer, shape }) => {
                console.log(workingLayer)
                console.log(shape)
            });
        }
        if (receivers && receivers.length > 0) {
            if(mapRef.current) {
                mapRef.current.setView([receivers[0].site.latitude, receivers[0].site.longitude], 15)
            }
        }
    }, [mapRef.current])

    useEffect(() => {
        if(mapRef.current) {
            areaLayerRef.current.forEach(layer => (layer as L.Layer).remove())
            areaLayerRef.current = []
            selectedAreas.forEach(area => {
                areaLayerRef.current.push(L.geoJSON({
                    "type": area.shape.geometry.type,
                    "name": area.id,
                    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features": selectedAreas.map(sa => sa.shape)
                }, {"style": {
                        "fillColor": area.color,
                        "color": area.color,
                        "weight": 3
                    }}).addTo(mapRef.current))
            })
        }
    }, [selectedAreas])

    useEffect(() => {
        document.addEventListener('keypress', handlePositionPick);
        return () => {
            document.removeEventListener('keypress', handlePositionPick);
        }
    }, [positionRef, toast])

    const handlePositionPick = useCallback((e) => {
        if (e.key === 'p' && positionRef.current) {
            const position = positionRef.current;
            copyTextToClipboard(position).then(() => {
                toast.showInfo("Position picked: " + positionRef.current);
            }).catch(err => {
                toast.showError("Position cannot be copied to clipboard.");
            })
        }
    }, [positionRef, toast])

    const reloadData = () => {
        setLoading(true);
        Promise.all([ReloadData(), GetAreas()]).then((result) => {
            setContentLoaded(result[0]);
            setAreas(result[1]);
            if(selectedAreas.length > 0) {
                setSelectedAreas(result[1].filter(a => selectedAreas.map(sa => sa.id).includes(a.id)));
            }
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        });
    }

    const onBackClick = useCallback(() => {
        navigate(-1);
    }, [navigate])

    const renderTransponders = () => {
        return transponders?.map((transponder) => {
            // @ts-ignore
            if (selectedTransponders === transponder) {
                return <Fragment>
                    {/** @ts-ignore */}
                    <Marker position={[transponder.site.latitude, transponder.site.longitude]} icon={transponderIcon}>
                        {entityDescription(transponder)}
                    </Marker>
                    {mapEntity(transponder, colors.transponder, 8, 0.3)}
                </Fragment>

            }
            return mapEntity(transponder, colors.transponder, 8, 0.3)
        })

    }
    const renderTransmitters = () => {
        return transmitters?.map((transmitter) => {
            // @ts-ignore
            if (selectedTransmitters === transmitter) {
                return <Fragment>
                    {/** @ts-ignore */}
                    <Marker position={[transmitter.site.latitude, transmitter.site.longitude]} icon={transmitterIcon}>
                        {entityDescription(transmitter)}
                    </Marker>
                    {mapEntity(transmitter, colors.transmitter, 12, 0.3)}
                </Fragment>

            }
            return mapEntity(transmitter, colors.transmitter, 12, 0.3)
        })

    }

    const renderReceivers = () => {
        const ids = selectedReceivers.map(r => r.id);
        return receivers?.map((receiver) => {
            // let billBoard = null
            if (ids.includes(receiver.id)) {
                return <Fragment>
                    {/** @ts-ignore */}
                    <Marker position={[receiver.site.latitude, receiver.site.longitude]} icon={receiverIcon}>
                        {entityDescription(receiver)}
                    </Marker>
                    {mapEntity(receiver, colors.receiver, 16, 0.2)}
                </Fragment>
            }
            return mapEntity(receiver, colors.receiver, 16, 0.2)
        })
    }

    // const renderSelectedAreas = () => {
    //     return selectedAreas?.map(area => {
    //         return <GeoJSON
    //         key={area.id}
    //         data={{
    //             "type": area.shape.geometry.type,
    //             "name": area.id,
    //             "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    //             "features": selectedAreas.map(sa => sa.shape)
    //         }}
    //         pathOptions={{color: area.color}}
    //     />})
    // }

    return <Fragment>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '50px', top: '10px', zIndex: 1000}}
            type="button" icon="pi pi-arrow-down"
            onClick={(e) => op.current.toggle(e)}/>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '90px', top: '10px', zIndex: 1000}}
            type="button" icon="pi pi-refresh"
            onClick={reloadData}/>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '130px', top: '10px', zIndex: 1000}}
            type="button" icon="pi pi-arrow-left"
            onClick={onBackClick}/>
        <OverlayPanel ref={op} showCloseIcon style={{maxWidth: '300px'}} dismissable={false}>
            <MapPanel
                receivers={receivers}
                setSelectedReceivers={setSelectedReceivers}
                transmitters={transmitters}
                transponders={transponders}
                areas={areas}
                selectedTransmitters={selectedTransmitters}
                selectedTransponders={selectedTransponders}
                selectedReceivers={selectedReceivers}
                selectedAreas={selectedAreas}
                setSelectedAreas={setSelectedAreas}
                setSelectedTransmitters={setSelectedTransmitters}
                setSelectedTransponders={setSelectedTransponders}
            />
        </OverlayPanel>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{height : '100vh'}} scrollWheelZoom={true} ref={mapRef}>
            <TileLayer url="http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
            <LayersControl position="topright">
                <LayersControl.Overlay checked name="Receivers">
                    <LayerGroup>
                        {renderReceivers()}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Transmitters">
                    <LayerGroup>
                        {renderTransmitters()}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Transponders">
                    <LayerGroup>
                        {renderTransponders()}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
        <MapLegent />
    </Fragment>
}
