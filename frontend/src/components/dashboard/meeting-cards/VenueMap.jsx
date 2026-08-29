import { useEffect } from "react"
import { getDistanceInMeters } from "../leafletIcons"
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import { venuePin, userPin } from "../leafletIcons"
import { MapPin } from 'lucide-react'


// Helper component to dynamically adjust map bounds to include both venue and user location
function RecenterAutomatically({ venueLat, venueLng, userLocation }) {
    const map = useMap()

    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            const bounds = [
                [venueLat, venueLng],
                [userLocation.lat, userLocation.lng]
            ]
            map.fitBounds(bounds, { padding: [30, 30] })
        } else {
            map.setView([venueLat, venueLng], 16)
        }
    }, [venueLat, venueLng, userLocation, map])

    return null
}

const VenueMap = ({meeting, userLocation, cardStyle, signInError, signingIn, formatTime, member, handleSignIn, signInClose}) => {

        const isLate = meeting.state === 'open_late'
        const totalCost = isLate
            ? meeting.meeting_cost + meeting.lateness_cost
            : meeting.meeting_cost    
        const venueLat = parseFloat(meeting.venue_lat)
        const venueLng = parseFloat(meeting.venue_lng)    
        // Calculate distance if user location is available
        const distanceMeters = (userLocation && userLocation.lat && userLocation.lng)
            ? getDistanceInMeters(userLocation.lat, userLocation.lng, venueLat, venueLng)
            : null    
        // Format distance string
        const formattedDistance = distanceMeters !== null
            ? distanceMeters >= 1000
                ? `${(distanceMeters / 1000).toFixed(1)}km away`
                : `${distanceMeters}m away`
            : null    
        // Check if user is within the geofence radius
        const isWithinGeofence = distanceMeters !== null && distanceMeters <= meeting.radius_meters
  return (
             <div style={{ ...cardStyle, padding: '16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                            Today's Meeting
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                            {meeting.title}
                        </div>
                    </div>
                    <div style={{
                        background: isLate ? '#fff8e6' : '#e6f4ee',
                        color: isLate ? '#d4900a' : '#008751',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap'
                    }}>
                        {isLate ? 'Late' : 'On time'}
                    </div>
                </div>

                {signInError && (
                    signInError.includes('suspended') ? (
                        <div style={{
                            background: '#fff0f0',
                            borderRadius: '14px',
                            padding: '20px',
                            textAlign: 'center',
                            border: '1px solid #e53e3e'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔒</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e53e3e', marginBottom: '6px' }}>
                                Account Suspended
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6 }}>
                                {signInError}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            background: '#fff0f0',
                            color: '#e53e3e',
                            fontSize: '0.78rem',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            {signInError}
                        </div>
                    )
                )}

                <div style={{
                    position: 'relative',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    height: '260px'
                }}>

                    <MapContainer
                        center={[venueLat, venueLng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        scrollWheelZoom={true}
                        dragging={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution=""
                        />

                        {/* Venue location marker */}
                        <Marker position={[venueLat, venueLng]} icon={venuePin} />

                        {/* Geofence area */}
                        <Circle
                            center={[venueLat, venueLng]}
                            radius={meeting.radius_meters}
                            pathOptions={{ color: '#008751', fillColor: '#008751', fillOpacity: 0.15 }}
                        />

                        {userLocation && userLocation.lat && userLocation.lng && (
                            <>
                                {/* Explicit user position marker */}
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={userPin} />

                                {/* Dynamic bounds handler */}
                                <RecenterAutomatically
                                    venueLat={venueLat}
                                    venueLng={venueLng}
                                    userLocation={userLocation}
                                />
                            </>
                        )}
                    </MapContainer>
                        
                    {/* RECTANGULAR BUTTON & INFO OVERLAY */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        right: '10px',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.40)',
                        backdropFilter: 'blur(4px)',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                             {formattedDistance && (
                                <>
                                    <span
                                    style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: isWithinGeofence ? '#008751' : '#e53e3e',
                                    }}
                                    >
                                    📍 {formattedDistance}
                                    </span>
                                </>
                            )}

                                <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    background: isLate ? '#fff8e6' : '#e6f4ee',
                                    color: isLate ? '#d4900a' : '#008751',
                                    padding: '2px 6px',
                                    borderRadius: '6px'
                                }}>
                                    {totalCost} Token{totalCost !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.65rem', color: '#8fa396' }}>
                                Closes at {formatTime(signInClose)}
                            </div>
                        </div>

                        <button
                            onClick={handleSignIn}
                            disabled={member.token_balance < totalCost || signingIn || !(userLocation && isWithinGeofence)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                background: member.token_balance < totalCost || !(userLocation && isWithinGeofence)
                                    ? '#c2e0cf' : '#008751',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: member.token_balance < totalCost || signingIn || !userLocation
                                    ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 8px rgba(0,135,81,0.25)'
                            }}
                        >
                            <MapPin size={16} color="white" />
                            {signingIn ? 'Signing in...'
                                : member.token_balance < totalCost ? 'No Tokens'
                                : !userLocation ? 'No GPS'
                                : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
  )
}

export default VenueMap