import {CesiumComponentRef, Entity, EntityDescription, Viewer} from "resium";
import {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {OverlayPanel} from "primereact/overlaypanel";
import {useAppContext} from "../context/AppContext";
import {main} from "../../wailsjs/go/models";
import MapPanel from "./MapPanel";
import * as Cesium from "cesium";
import {SceneMode} from "cesium";
import {ReloadData} from "../../wailsjs/go/main/App";
import Receiver = main.Receiver;
import Transmitter = main.Transmitter;
import Transponder = main.Transponder;
import {useNavigate} from "react-router-dom";

const colors = {
    receiver: Cesium.Color.fromCssColorString('rgb(255,0,0)'),
    transmitter: Cesium.Color.fromCssColorString('rgba(0,64,255,0.88)'),
    transponder: Cesium.Color.fromCssColorString('rgba(0,255,0,0.88)'),
    combined: Cesium.Color.fromCssColorString('rgba(255,255,0,0.89)')
}

const pinBuilder = new Cesium.PinBuilder();

export default function Map() {
    const mapRef = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
    const op = useRef(null);
    const navigate = useNavigate();
    const {receivers, transmitters, transponders, setLoading, setContentLoaded, toast} = useAppContext();
    const [selectedReceivers, setSelectedReceivers] = useState([] as Array<Receiver>);
    const [selectedTransmitters, setSelectedTransmitters] = useState([] as Array<Transmitter>);
    const [selectedTransponders, setSelectedTransponders] = useState([] as Array<Transponder>);

    useEffect(() => {
        if(receivers && receivers.length > 0) {
           mapRef.current.cesiumElement.camera.flyTo({
               destination: Cesium.Cartesian3.fromDegrees(receivers[0].site.longitude, receivers[0].site.latitude, 20000),
               maximumHeight: 20000,
               duration: 2
           })
        }
    }, [])

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

    const mapEntity = (entity: Receiver | Transmitter | Transponder, color: Cesium.Color, billBoard?: Cesium.BillboardGraphics) => {
        return <Entity
            key={entity.id}
            name={entity.id}
            billboard={billBoard}
            point={{pixelSize: 8, color: color}}
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
            // @ts-ignore
            if (selectedTransponders === transponder) {
                billBoard = {
                    // @ts-ignore
                    image: pinBuilder.fromText(transponder.id, colors.transponder, 96).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            }
            return mapEntity(transponder, colors.transponder, billBoard)
        })
    }

    const renderTransmitters = () => {
        return transmitters?.map((transmitter) => {
            let billBoard = null
            // @ts-ignore
            if (selectedTransmitters === transmitter) {
                billBoard = {
                    // @ts-ignore
                    image: pinBuilder.fromText(transmitter.id, colors.transmitter, 96).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            }
            return mapEntity(transmitter, colors.transmitter, billBoard)
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
            return mapEntity(receiver, colors.receiver, billBoard)
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
                selectedTransmitters={selectedTransmitters}
                selectedTransponders={selectedTransponders}
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
    </Fragment>
}
