import { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'

// Custom Leaflet Green Venue Pin Icon
const venuePin = L.divIcon({
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#008751">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
})

// Auto-recenter helper
function MapRecenter({ lat, lng }) {
    const map = useMap()
    useEffect(() => {
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], map.getZoom())
        }
    }, [lat, lng, map])
    return null
}

// Marker component supporting click-to-place & drag-to-place
function DraggableMarker({ position, onPositionChange }) {
    const markerRef = useRef(null)

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng)
        }
    })

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const latLng = marker.getLatLng()
                    onPositionChange(latLng.lat, latLng.lng)
                }
            },
        }),
        [onPositionChange],
    )

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={venuePin}
        />
    )
}

export default function LocationPickerMap({ lat, lng, onPositionChange, height = '200px' }) {
    return (
        <div style={{
            height,
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '10px',
            border: '1px solid #e8ece9'
        }}>
            <MapContainer
                center={[lat, lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution=""
                />
                <DraggableMarker
                    position={[lat, lng]}
                    onPositionChange={onPositionChange}
                />
                <MapRecenter lat={lat} lng={lng} />
            </MapContainer>
        </div>
    )
}