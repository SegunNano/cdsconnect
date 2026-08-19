import { useState } from 'react'
import { Plus, Locate } from 'lucide-react'
import LocationPickerMap from './LocationPickerMap'
import { createMeeting } from '../../services/dev.service'
import { DEFAULT_VENUE_LAT, DEFAULT_VENUE_LNG } from '../../constants'

export default function MeetingsTab({ meetings, inputStyle, sectionHead, card, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        meeting_date: '',
        sign_in_open: '',
        late_threshold: '',
        sign_in_close: '',
        venue_lat: DEFAULT_VENUE_LAT,
        venue_lng: DEFAULT_VENUE_LNG,
        radius_meters: 100,
        meeting_cost: 1,
        lateness_cost: 1,
        useDefault: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [gettingGps, setGettingGps] = useState(false)

    const handlePositionChange = (lat, lng) => {
        setForm(prev => ({
            ...prev,
            venue_lat: parseFloat(lat.toFixed(6)),
            venue_lng: parseFloat(lng.toFixed(6))
        }))
    }

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setGettingGps(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handlePositionChange(pos.coords.latitude, pos.coords.longitude)
                setGettingGps(false)
            },
            (err) => {
                console.error(err)
                alert('Failed to fetch current location')
                setGettingGps(false)
            },
            { enableHighAccuracy: true }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await createMeeting({
                ...form,
                venue_lat: form.useDefault ? DEFAULT_VENUE_LAT : parseFloat(form.venue_lat),
                venue_lng: form.useDefault ? DEFAULT_VENUE_LNG : parseFloat(form.venue_lng)
            })
            onCreated(result.data)
            setShowForm(false)
            setForm({
                title: '', meeting_date: '',
                sign_in_open: '', late_threshold: '',
                sign_in_close: '', venue_lat: DEFAULT_VENUE_LAT,
                venue_lng: DEFAULT_VENUE_LNG, radius_meters: 100,
                meeting_cost: 1, lateness_cost: 1, useDefault: true
            })
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create meeting')
        } finally {
            setLoading(false)
        }
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px'
    }

    const currentLat = parseFloat(form.venue_lat) || DEFAULT_VENUE_LAT
    const currentLng = parseFloat(form.venue_lng) || DEFAULT_VENUE_LNG

    return (
        <>
            <button
                onClick={() => setShowForm(!showForm)}
                style={{
                    width: '100%',
                    background: '#008751',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginBottom: '14px'
                }}
            >
                <Plus size={16} color="white" />
                {showForm ? 'Cancel' : 'Create Meeting'}
            </button>

            {showForm && (
                <div style={{ ...card, marginBottom: '14px' }}>
                    {error && (
                        <div style={{
                            background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem',
                            padding: '10px 14px', borderRadius: '10px', marginBottom: '12px'
                        }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <label style={labelStyle}>Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. August General Meeting"
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Meeting Date</label>
                        <input
                            type="date"
                            value={form.meeting_date}
                            onChange={e => setForm({ ...form, meeting_date: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Sign-in Opens</label>
                        <input
                            type="datetime-local"
                            value={form.sign_in_open}
                            onChange={e => setForm({ ...form, sign_in_open: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Late After</label>
                        <input
                            type="datetime-local"
                            value={form.late_threshold}
                            onChange={e => setForm({ ...form, late_threshold: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Sign-in Closes</label>
                        <input
                            type="datetime-local"
                            value={form.sign_in_close}
                            onChange={e => setForm({ ...form, sign_in_close: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <input
                                type="checkbox"
                                id="useDefault"
                                checked={form.useDefault}
                                onChange={e => {
                                    const checked = e.target.checked
                                    setForm(prev => ({
                                        ...prev,
                                        useDefault: checked,
                                        venue_lat: checked ? DEFAULT_VENUE_LAT : prev.venue_lat,
                                        venue_lng: checked ? DEFAULT_VENUE_LNG : prev.venue_lng
                                    }))
                                }}
                            />
                            <label htmlFor="useDefault" style={{ fontSize: '0.82rem', color: '#4a5e52', fontWeight: 500 }}>
                                Use default venue location
                            </label>
                        </div>

                        {!form.useDefault && (
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <label style={labelStyle}>Pick Location on Map</label>
                                    <button
                                        type="button"
                                        onClick={handleCurrentLocation}
                                        disabled={gettingGps}
                                        style={{
                                            background: '#e6f4ee', border: 'none', borderRadius: '6px',
                                            padding: '4px 8px', fontSize: '0.68rem', fontWeight: 600,
                                            color: '#008751', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <Locate size={12} color="#008751" />
                                        {gettingGps ? 'Locating...' : 'Use My Location'}
                                    </button>
                                </div>

                                <LocationPickerMap
                                    lat={currentLat}
                                    lng={currentLng}
                                    onPositionChange={handlePositionChange}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div>
                                        <label style={labelStyle}>Latitude</label>
                                        <input
                                            type="number" step="any"
                                            value={form.venue_lat}
                                            onChange={e => setForm({ ...form, venue_lat: e.target.value })}
                                            style={{ ...inputStyle, marginBottom: '0' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Longitude</label>
                                        <input
                                            type="number" step="any"
                                            value={form.venue_lng}
                                            onChange={e => setForm({ ...form, venue_lng: e.target.value })}
                                            style={{ ...inputStyle, marginBottom: '0' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                            <div>
                                <label style={labelStyle}>Meeting Cost (tokens)</label>
                                <input
                                    type="number" min="1"
                                    value={form.meeting_cost}
                                    onChange={e => setForm({ ...form, meeting_cost: parseInt(e.target.value) || 0 })}
                                    style={{ ...inputStyle, marginBottom: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Lateness Cost (tokens)</label>
                                <input
                                    type="number" min="0"
                                    value={form.lateness_cost}
                                    onChange={e => setForm({ ...form, lateness_cost: parseInt(e.target.value) || 0 })}
                                    style={{ ...inputStyle, marginBottom: '10px' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading ? '#c2e0cf' : '#008751',
                                border: 'none', borderRadius: '12px', padding: '13px',
                                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.88rem',
                                fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </form>
                </div>
            )}

            <div style={sectionHead}>All Meetings</div>
            {meetings.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#8fa396', fontSize: '0.82rem' }}>
                    No meetings yet
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meetings.map(meeting => (
                    <div key={meeting.id} style={card}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '4px' }}>
                            {meeting.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            {meeting.meeting_date} · {meeting.meeting_cost} token · late +{meeting.lateness_cost}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}