import {Viewer} from "resium";
import {useResizeListener} from "primereact/hooks";
import {Fragment, useEffect, useState} from "react";

export default function Map() {
    const [size, setSize] = useState({width: 0, height: 0});
    const [bindWindowResizeListener, unbindWindowResizeListener] = useResizeListener({
        listener: (event) => {
            setSize({
                // @ts-ignore
                width: event.currentTarget.innerWidth + 'px',
                // @ts-ignore
                height: event.currentTarget.innerHeight + 'px'
            })
        }
    });

    useEffect(() => {
        bindWindowResizeListener();

        return () => {
            unbindWindowResizeListener();
        };
    }, [bindWindowResizeListener, unbindWindowResizeListener]);

    return <Fragment>
        <div className="map-toolbar"></div>
        <Viewer full/>
    </Fragment>
}
