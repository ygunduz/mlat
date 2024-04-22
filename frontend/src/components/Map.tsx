import {CesiumComponentRef, CesiumMovementEvent, Entity, EntityDescription, Label, Viewer} from "resium";
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
import {SceneMode, IonImageryProvider} from "cesium";
import MapLegent from "./MapLegent";
import {copyTextToClipboard} from "../helpers";

const colors = {
    receiver: Cesium.Color.fromCssColorString('rgb(255,0,0)'),
    transmitter: Cesium.Color.fromCssColorString('rgba(0,64,255,0.88)'),
    transponder: Cesium.Color.fromCssColorString('rgba(0,255,0,0.88)'),
    hasReceiverTransmitter: Cesium.Color.fromCssColorString('rgba(255,255,0,0.89)'),
    hasReceiverTransponder: Cesium.Color.fromCssColorString('rgba(255,0,255,0.89)')
}

const pinBuilder = new Cesium.PinBuilder();

const imagery = new IonImageryProvider({assetId:3954, accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDJlYWJmNS05NTQ4LTQ2NTctODc3Yi1kMTJhZDU4MzI0YzciLCJpZCI6MTI5NDk3LCJpYXQiOjE2NzkzMTYyMzZ9.ue9eyaNX1MqGVpEK0cq0eGebGFf1lLtM5ZkMhMhhxUg'})

export default function Map() {
    const mapRef = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
    const entityRef = useRef<CesiumComponentRef<Cesium.Entity>>(null);
    const positionRef = useRef<string>(null);
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
        if (mapRef.current?.cesiumElement?.dataSources) {
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
    const mapEntity = (entity: Receiver | Transmitter | Transponder, color: Cesium.Color, hasPoint: boolean = true, billBoard?: Cesium.BillboardGraphics) => {
        return <Entity
            key={entity.id}
            name={entity.id}
            billboard={billBoard}
            point={hasPoint ? {pixelSize: 8, color: color, outlineWidth: 1} : undefined}
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

    const onMouseMove = (movement: CesiumMovementEvent) => {
        const scene = mapRef?.current?.cesiumElement?.scene;
        const camera = mapRef?.current?.cesiumElement?.camera;
        if (!scene || !camera || !entityRef?.current) {
            return;
        }
        const cartesian = camera.pickEllipsoid(
            movement.endPosition,
            scene.globe.ellipsoid
        );
        if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(
                cartesian
            );
            const longitudeString = Cesium.Math.toDegrees(
                cartographic.longitude
            ).toFixed(6);
            const latitudeString = Cesium.Math.toDegrees(
                cartographic.latitude
            ).toFixed(6);

            const entity = entityRef.current.cesiumElement;
            // @ts-ignore
            entity.position = cartesian;
            // @ts-ignore
            entity.label.show = true;
            // @ts-ignore
            entity.label.text =
                `Lat: ${`${latitudeString}`}\u00B0` +
                `\nLon: ${`${longitudeString}`}\u00B0`;
            positionRef.current = `<Lat>${latitudeString}</Lat>\n<Lon>${longitudeString}</Lon>`;
        } else {
            // @ts-ignore
            entityRef.current.cesiumElement.label.show = false;
        }
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
                selectedReceivers={selectedReceivers}
                selectedAreas={selectedAreas}
                setSelectedAreas={setSelectedAreas}
                setSelectedTransmitters={setSelectedTransmitters}
                setSelectedTransponders={setSelectedTransponders}
            />
        </OverlayPanel>
        <Viewer
            full
            ref={mapRef}
            onMouseMove={onMouseMove}
            sceneModePicker={false}
            navigationHelpButton={false}
            homeButton={false}
            fullscreenButton={false}
            imageryProvider={imagery}
            sceneMode={SceneMode.SCENE2D}>
            {renderReceivers()}
            {renderTransmitters()}
            {renderTransponders()}
            <Entity
                ref={entityRef}
                label={{
                    show: false,
                    showBackground: true,
                    font: '14px monospace',
                    eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -0.1),
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    verticalOrigin: Cesium.VerticalOrigin.TOP,
                    pixelOffset: new Cesium.Cartesian2(15, 0)
                }}
            />
        </Viewer>
        <MapLegent />
    </Fragment>
}
