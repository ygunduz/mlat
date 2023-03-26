import {CesiumComponentRef, Entity, EntityDescription, Viewer} from "resium";
import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {OverlayPanel} from "primereact/overlaypanel";
import {useAppContext} from "../context/AppContext";
import {main} from "../../wailsjs/go/models";
import MapPanel from "./MapPanel";
import * as Cesium from "cesium";
import {ReloadData} from "../../wailsjs/go/main/App";
import Receiver = main.Receiver;
import Transmitter = main.Transmitter;
import Transponder = main.Transponder;
import {useNavigate} from "react-router-dom";
import {AreaType, GetAreas} from "../helpers/AreaHelpers";
import {SceneMode} from "cesium";
import MapLegend from "./MapLegend";

const colors = {
    receiver: Cesium.Color.fromCssColorString('rgb(255,0,0)'),
    transmitter: Cesium.Color.fromCssColorString('rgba(0,64,255,0.88)'),
    transponder: Cesium.Color.fromCssColorString('rgba(0,255,0,0.88)'),
    hasReceiverTransmitter: Cesium.Color.fromCssColorString('rgba(255,255,0,0.89)'),
    hasReceiverTransponder: Cesium.Color.fromCssColorString('rgba(255,0,255,0.89)')
}

const pinBuilder = new Cesium.PinBuilder();

export default function Map() {
    const mapRef = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
    const op = useRef(null);
    const navigate = useNavigate();
    const {
        receivers,
        transmitters,
        transponders,
        areas,
        ignoredReceivers,
        transmitterHasReceiver,
        transponderHasReceiver,
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
        if (receivers && receivers.length > 0) {
            mapRef.current.cesiumElement.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(receivers[0].site.longitude, receivers[0].site.latitude, 20000),
                maximumHeight: 20000,
                duration: 2
            })
        }

        return () => {
            if (mapRef.current?.cesiumElement) {
                mapRef.current.cesiumElement.destroy();
            }
        }
    }, [])

    useEffect(() => {
        if (mapRef.current?.cesiumElement) {
            if (selectedAreas.length === 0) {
                mapRef.current.cesiumElement.dataSources.removeAll(true)
            } else {
                mapRef.current.cesiumElement.dataSources.removeAll(true);
                Cesium.GeoJsonDataSource.load({
                    "type": "FeatureCollection",
                    "name": "MyPolygon",
                    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features": selectedAreas.map(sa => sa.shape)
                }).then((ds) => {
                    mapRef.current.cesiumElement.dataSources.add(ds)
                });
            }
        }
    }, [selectedAreas])

    const reloadData = useCallback(() => {
        setLoading(true);
        ReloadData().then((result) => {
            setContentLoaded(result);
        }).catch(err => {
            toast.showError(err);
            setLoading(false);
        });
    }, [setLoading, setContentLoaded])

    const onBackClick = useCallback(() => {
        navigate(-1);
    }, [navigate])
    const mapEntity = (entity: Receiver | Transmitter | Transponder, color: Cesium.Color, hasPoint: boolean = true, billBoard?: Cesium.BillboardGraphics) => {
        return <Entity
            key={entity.id}
            name={entity.id}
            billboard={billBoard}
            point={hasPoint ? {pixelSize: 8, color: color} : undefined}
            position={Cesium.Cartesian3.fromDegrees(entity.site.longitude, entity.site.latitude, entity.site.height)}
        >
            <EntityDescription>
                <dl>
                    <dt>Id: {entity.id}</dt>
                    <dt>Site: {entity.site.id}</dt>
                    <dt>Description: {entity.site.description}</dt>
                    <dt>Latitude: {entity.site.latitude}</dt>
                    <dt>Longitude: {entity.site.longitude}</dt>
                    <dt>Height: {entity.site.height}</dt>
                    {/*@ts-ignore*/}
                    {entity.coveredReceivers && <dt>CoveredReceivers: {entity.coveredReceivers}</dt>}
                </dl>
            </EntityDescription>
        </Entity>

    }
    const renderTransponders = () => {
        return transponders?.map((transponder) => {
            let billBoard = null
            let color = colors.transponder;
            // @ts-ignore
            if (selectedTransponders === transponder) {
                billBoard = {
                    // @ts-ignore
                    image: pinBuilder.fromText(transponder.id, colors.transponder, 96).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            }
            if (transponderHasReceiver.includes(transponder.id)) {
                color = colors.hasReceiverTransponder;
            }
            return mapEntity(transponder, color, true, billBoard)
        })

    }
    const renderTransmitters = () => {
        return transmitters?.map((transmitter) => {
            let billBoard = null
            let color = colors.transmitter;
            // @ts-ignore
            if (selectedTransmitters === transmitter) {
                billBoard = {
                    // @ts-ignore
                    image: pinBuilder.fromText(transmitter.id, colors.transmitter, 96).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            }
            if (transmitterHasReceiver.includes(transmitter.id)) {
                color = colors.hasReceiverTransmitter;
            }
            return mapEntity(transmitter, color, true, billBoard)
        })

    }

    const renderReceivers = () => {
        const ids = selectedReceivers.map(r => r.id);
        return receivers?.map((receiver) => {
            let billBoard = null
            if (ids.includes(receiver.id)) {
                billBoard = {
                    image: pinBuilder.fromText(receiver.id, Cesium.Color.RED, 64).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            }
            const ignore = ignoredReceivers.includes(receiver.id);
            return mapEntity(receiver, colors.receiver, !ignore, billBoard)
        })
    }

    return <Fragment>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '10px', top: '10px', zIndex: 1000}}
            type="button" icon="pi pi-arrow-down"
            onClick={(e) => op.current.toggle(e)}/>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '50px', top: '10px', zIndex: 1000}}
            type="button" icon="pi pi-refresh"
            onClick={reloadData}/>
        <Button
            className="p-button-sm"
            style={{position: "absolute", left: '90px', top: '10px', zIndex: 1000}}
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
                selectedAreas={selectedAreas}
                setSelectedAreas={setSelectedAreas}
                setSelectedTransmitters={setSelectedTransmitters}
                setSelectedTransponders={setSelectedTransponders}
            />
        </OverlayPanel>
        <Viewer
            full
            ref={mapRef}
            sceneMode={SceneMode.SCENE2D}>
            {renderReceivers()}
            {renderTransmitters()}
            {renderTransponders()}
        </Viewer>
        <MapLegend />
    </Fragment>
}
