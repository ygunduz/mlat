import "./icon.css"

export default function ReceiverIcon({size = 18, selected = false, className = ""}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className={className}
            width={size} // added size here
            height={size} // added size here
            fill={selected ? "black" : "white"} // added color here
        >
            <path className={selected ? "st0" : "st1"} d="M23.8,3.1c5.3,5.3,5.3,13.8,0,19.1s-13.8,5.3-19.1,0"/>
            <path className={selected ? "st0" : "st1"} d="M14,26.5c-0.6,1-1,2.2-1,3.5h14c0-3-1.9-5.6-4.6-6.6"/>
            <path className={selected ? "st0" : "st1"} d="M12,15L12,15c2.2,0,4-1.8,4-4v0L6,5L12,15z"/>
            <path className={selected ? "st0" : "st1"}
                  d="M11,8c5.1-4.8,10.7-7,12.8-4.9c2.2,2.2-0.3,8.2-5.6,13.5S7,24.4,4.8,22.2C2.8,20.2,4.7,15,9,10"/>
        </svg>
    )
}
