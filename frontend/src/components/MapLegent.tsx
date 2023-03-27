export default function MapLegent() {
    return (
        <div className="map-legend">
            <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#ff0000'}}/>
                <div className="legend-text">Receiver</div>
            </div>
            <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#0040FFE0'}}/>
                <div className="legend-text">Transmitter</div>
            </div>
            <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#00FF00E0'}}/>
                <div className="legend-text">Transponder</div>
            </div>
            <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#FFFF00E2'}}/>
                <div className="legend-text">Transmitter & Receiver</div>
            </div>
            <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#FF00FFE2'}}/>
                <div className="legend-text">Transponder & Receiver</div>
            </div>
        </div>
    )
}
