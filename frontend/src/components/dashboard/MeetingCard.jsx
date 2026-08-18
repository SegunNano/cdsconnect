import { useEffect } from 'react'
import { MapPin, CalendarOff } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import { venuePin, userPin, getDistanceInMeters } from './leafletIcons'

// Helper component to dynamically adjust map bounds to include both venue and user location
function RecenterAutomatically({ venueLat, venueLng, userLocation }) {
    const map = useMap()

    useEffect(() => {
        // Add optional chaining and null check
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

export function MeetingCard({ meeting, member, handleSignIn, signingIn, signInError, userLocation, locationLoading }) {
    const cardStyle = {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '14px'
    }

    if (!meeting) {
        return (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '30px 20px' }}>
                <CalendarOff size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                    No upcoming meeting
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                    Check back later
                </div>
            </div>
        )
    }

    const meetingDate = new Date(meeting.meeting_date)
    const day = meetingDate.getUTCDate()
    const month = meetingDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)
    const lateThreshold = new Date(meeting.late_threshold)

    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    if (meeting.state === 'upcoming') {
        return (
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        background: '#008751',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        textAlign: 'center',
                        flexShrink: 0
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{month}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#008751', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                            Upcoming Meeting
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '3px' }}>
                            {meeting.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            Opens at {formatTime(signInOpen)}
                        </div>
                    </div>
                    <div style={{
                        background: '#e6f4ee',
                        color: '#008751',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        flexShrink: 0
                    }}>
                        {meeting.meeting_cost} token
                    </div>
                </div>
            </div>
        )
    }

    if (meeting.state === 'today_not_open') {
        return (
            <div style={cardStyle}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{ background: '#f2f4f7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500 }}>
                        Sign-in opens at <strong style={{ color: '#008751' }}>{formatTime(signInOpen)}</strong>
                    </div>
                </div>
            </div>
        )
    }

    if (meeting.state === 'open_on_time' || meeting.state === 'open_late') {
    const isLate = meeting.state === 'open_late'
    const totalCost = isLate
        ? meeting.meeting_cost + meeting.lateness_cost
        : meeting.meeting_cost

    const venueLat = parseFloat(meeting.venue_lat)
    const venueLng = parseFloat(meeting.venue_lng)

    // Calculate distance if user location is available
    // Safely compute distance only if userLocation exists
    const distanceMeters = (userLocation && userLocation.lat && userLocation.lng)
        ? getDistanceInMeters(userLocation.lat, userLocation.lng, venueLat, venueLng)
        : null

    // Format distance string (e.g., "120m away" or "1.4km away")
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
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: isWithinGeofence ? '#008751' : '#e53e3e'
                                }}>
                                    📍 {formattedDistance}
                                </span>
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
                        disabled={member.token_balance < totalCost || signingIn || !userLocation}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: member.token_balance < totalCost || !userLocation
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

    if (meeting.state === 'sign_in_closed') {
        return (
            <div style={cardStyle}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{ background: '#fff0f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 500 }}>
                        Sign-in is closed
                    </div>
                </div>
            </div>
        )
    }

    return null
}