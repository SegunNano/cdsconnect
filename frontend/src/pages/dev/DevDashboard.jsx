import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Users, Calendar, Layers,
    Settings, ToggleLeft, ToggleRight,
    ChevronRight, Shield, Smartphone,
    UserX, Plus, RefreshCw
} from 'lucide-react'
import {
    getAllMembers, updateMemberRole, toggleDevAccess,
    resetMemberDevice, deactivateMember,
    createMeeting, getAllMeetings,
    getAllStreams, createStream, toggleStreamActive,
    getRegistrationStatus, toggleRegistration
} from '../../services/dev.service'
import { ROLES, BREAKOUT_SESSIONS, DEFAULT_VENUE_LAT, DEFAULT_VENUE_LNG } from '../../constants'

export default function DevDashboard() {
    const { member } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('members')
    const [members, setMembers] = useState([])
    const [meetings, setMeetings] = useState([])
    const [streams, setStreams] = useState([])
    const [regStatus, setRegStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [membersRes, meetingsRes, streamsRes, regRes] = await Promise.all([
                getAllMembers(),
                getAllMeetings(),
                getAllStreams(),
                getRegistrationStatus()
            ])
            setMembers(membersRes.data)
            setMeetings(meetingsRes.data)
            setStreams(streamsRes.data)
            setRegStatus(regRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = members.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        m.state_code.toLowerCase().includes(search.toLowerCase())
    )

    const sectionHead = {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#8fa396',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '10px'
    }

    const card = {
        background: '#ffffff',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '10px'
    }

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 14px',
        fontSize: '0.85rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        marginBottom: '10px'
    }

    const tabs = [
        { key: 'members', label: 'Members', icon: Users },
        { key: 'meetings', label: 'Meetings', icon: Calendar },
        { key: 'streams', label: 'Streams', icon: Layers },
        { key: 'settings', label: 'Settings', icon: Settings }
    ]

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '90px'
        }}>

            {/* HEADER */}
            <div style={{
                background: '#ffffff',
                padding: '52px 20px 16px',
            }}>
                <div style={{ fontSize: '0.78rem', color: '#8fa396', marginBottom: '2px' }}>
                    Dev Panel
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12' }}>
                    <span style={{ color: '#008751' }}>🛠️</span> InfoTechCadre
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <MembersTab
                        members={filtered}
                        search={search}
                        setSearch={setSearch}
                        loading={loading}
                        selectedMember={selectedMember}
                        setSelectedMember={setSelectedMember}
                        onRoleUpdate={async (memberId, role) => {
                            await updateMemberRole(memberId, role)
                            setMembers(prev => prev.map(m =>
                                m.id === memberId ? { ...m, role } : m
                            ))
                        }}
                        onToggleDev={async (memberId) => {
                            const result = await toggleDevAccess(memberId)
                            setMembers(prev => prev.map(m =>
                                m.id === memberId ? { ...m, is_dev: result.data.is_dev } : m
                            ))
                        }}
                        onResetDevice={async (memberId) => {
                            await resetMemberDevice(memberId)
                            alert('Device reset successfully')
                        }}
                        onDeactivate={async (memberId) => {
                            await deactivateMember(memberId)
                            setMembers(prev => prev.map(m =>
                                m.id === memberId ? { ...m, is_active: false } : m
                            ))
                        }}
                        currentMemberId={member?.id}
                    />
                )}

                {/* MEETINGS TAB */}
                {activeTab === 'meetings' && (
                    <MeetingsTab
                        meetings={meetings}
                        inputStyle={inputStyle}
                        sectionHead={sectionHead}
                        card={card}
                        onCreated={(meeting) => setMeetings(prev => [meeting, ...prev])}
                    />
                )}

                {/* STREAMS TAB */}
                {activeTab === 'streams' && (
                    <StreamsTab
                        streams={streams}
                        inputStyle={inputStyle}
                        sectionHead={sectionHead}
                        card={card}
                        onCreated={(stream) => setStreams(prev => [stream, ...prev])}
                        onToggle={async (streamId) => {
                            const result = await toggleStreamActive(streamId)
                            setStreams(prev => prev.map(s =>
                                s.id === streamId ? result.data : s
                            ))
                        }}
                    />
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <SettingsTab
                        regStatus={regStatus}
                        card={card}
                        sectionHead={sectionHead}
                        onToggle={async () => {
                            const result = await toggleRegistration()
                            setRegStatus(prev => ({
                                ...prev,
                                registration_open: result.data.registration_open
                            }))
                        }}
                    />
                )}

            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '390px',
                background: '#ffffff',
                borderTop: '1px solid #e8ece9',
                display: 'flex',
                padding: '10px 0 24px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <div
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#e6f4ee' : 'transparent',
                                borderRadius: '8px'
                            }}>
                                <Icon size={18} color={isActive ? '#008751' : '#8fa396'} />
                            </div>
                            <div style={{
                                fontSize: '0.58rem',
                                fontWeight: 600,
                                color: isActive ? '#008751' : '#8fa396',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {tab.label}
                            </div>
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}

// ── MEMBERS TAB ───────────────────────────────────
function MembersTab({ members, search, setSearch, loading, selectedMember, setSelectedMember, onRoleUpdate, onToggleDev, onResetDevice, onDeactivate, currentMemberId }) {
    return (
        <>
            {/* SEARCH */}
            <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '12px 16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
            }}>
                <Users size={16} color="#8fa396" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or state code"
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.85rem',
                        color: '#0d1b12',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background: 'transparent'
                    }}
                />
            </div>

            {loading && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                    Loading...
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map(m => (
                    <div key={m.id}>
                        {/* MEMBER ROW */}
                        <div
                            onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                            style={{
                                background: '#ffffff',
                                borderRadius: selectedMember?.id === m.id ? '14px 14px 0 0' : '14px',
                                padding: '14px 16px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                border: selectedMember?.id === m.id ? '2px solid #008751' : '2px solid transparent',
                                borderBottom: selectedMember?.id === m.id ? 'none' : '2px solid transparent'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: m.is_active ? '#e6f4ee' : '#f2f4f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: m.is_active ? '#008751' : '#8fa396',
                                flexShrink: 0
                            }}>
                                {m.first_name[0]}{m.last_name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: m.is_active ? '#0d1b12' : '#8fa396',
                                    marginBottom: '2px'
                                }}>
                                    {m.first_name} {m.last_name}
                                    {m.is_dev && (
                                        <span style={{
                                            background: '#eef2ff',
                                            color: '#4f46e5',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            marginLeft: '6px'
                                        }}>DEV</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                    {m.state_code} · {m.role?.replace('_', ' ')}
                                </div>
                            </div>
                            <ChevronRight
                                size={16}
                                color="#8fa396"
                                style={{
                                    transform: selectedMember?.id === m.id ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </div>

                        {/* EXPANDED ACTIONS */}
                        {selectedMember?.id === m.id && (
                            <div style={{
                                background: '#f8fdf9',
                                border: '2px solid #008751',
                                borderTop: 'none',
                                borderRadius: '0 0 14px 14px',
                                padding: '14px 16px',
                                marginBottom: '8px'
                            }}>
                                {/* ROLE SELECTOR */}
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                        Role
                                    </div>
                                    <select
                                        value={m.role}
                                        onChange={async (e) => {
                                            await onRoleUpdate(m.id, e.target.value)
                                        }}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #e8ece9',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            fontSize: '0.82rem',
                                            color: '#0d1b12',
                                            outline: 'none',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            appearance: 'none'
                                        }}
                                    >
                                        {ROLES.map(role => (
                                            <option key={role} value={role}>
                                                {role.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* TOGGLE DEV */}
                                    {m.id !== currentMemberId && (
                                        <button
                                            onClick={() => onToggleDev(m.id)}
                                            style={{
                                                background: m.is_dev ? '#fff8e6' : '#eef2ff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: m.is_dev ? '#d4900a' : '#4f46e5',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: '100%'
                                            }}
                                        >
                                            <Shield size={14} color={m.is_dev ? '#d4900a' : '#4f46e5'} />
                                            {m.is_dev ? 'Remove Dev Access' : 'Grant Dev Access'}
                                        </button>
                                    )}

                                    {/* RESET DEVICE */}
                                    <button
                                        onClick={() => onResetDevice(m.id)}
                                        style={{
                                            background: '#f2f4f7',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: '#4a5e52',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            width: '100%'
                                        }}
                                    >
                                        <Smartphone size={14} color="#4a5e52" />
                                        Reset Device
                                    </button>

                                    {/* DEACTIVATE */}
                                    {m.is_active && m.id !== currentMemberId && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Deactivate ${m.first_name}?`)) {
                                                    onDeactivate(m.id)
                                                }
                                            }}
                                            style={{
                                                background: '#fff0f0',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: '#e53e3e',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: '100%'
                                            }}
                                        >
                                            <UserX size={14} color="#e53e3e" />
                                            Deactivate Member
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}

// ── MEETINGS TAB ──────────────────────────────────
function MeetingsTab({ meetings, inputStyle, sectionHead, card, onCreated }) {
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await createMeeting({
                ...form,
                venue_lat: form.useDefault ? DEFAULT_VENUE_LAT : form.venue_lat,
                venue_lng: form.useDefault ? DEFAULT_VENUE_LNG : form.venue_lng
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

    return (
        <>
            {/* CREATE BUTTON */}
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

            {/* FORM */}
            {showForm && (
                <div style={{ ...card, marginBottom: '14px' }}>
                    {error && (
                        <div style={{
                            background: '#fff0f0',
                            color: '#e53e3e',
                            fontSize: '0.8rem',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            marginBottom: '12px'
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

                        {/* LOCATION */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <input
                                type="checkbox"
                                id="useDefault"
                                checked={form.useDefault}
                                onChange={e => setForm({ ...form, useDefault: e.target.checked })}
                            />
                            <label htmlFor="useDefault" style={{ fontSize: '0.82rem', color: '#4a5e52', fontWeight: 500 }}>
                                Use default venue location
                            </label>
                        </div>

                        {!form.useDefault && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <label style={labelStyle}>Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={form.venue_lat}
                                        onChange={e => setForm({ ...form, venue_lat: e.target.value })}
                                        style={{ ...inputStyle, marginBottom: '10px' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={form.venue_lng}
                                        onChange={e => setForm({ ...form, venue_lng: e.target.value })}
                                        style={{ ...inputStyle, marginBottom: '10px' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* COSTS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                                <label style={labelStyle}>Meeting Cost (tokens)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.meeting_cost}
                                    onChange={e => setForm({ ...form, meeting_cost: parseInt(e.target.value) })}
                                    style={{ ...inputStyle, marginBottom: '10px' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Lateness Cost (tokens)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.lateness_cost}
                                    onChange={e => setForm({ ...form, lateness_cost: parseInt(e.target.value) })}
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
                                border: 'none',
                                borderRadius: '12px',
                                padding: '13px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </form>
                </div>
            )}

            {/* MEETINGS LIST */}
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

// ── STREAMS TAB ───────────────────────────────────
function StreamsTab({ streams, inputStyle, sectionHead, card, onCreated, onToggle }) {
    const [form, setForm] = useState({
        year: new Date().getFullYear(),
        batch: 'A',
        stream: 1,
        callup_date: '',
        service_end: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await createStream(form)
            onCreated(result.data)
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create stream')
        } finally {
            setLoading(false)
        }
    }

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
                {showForm ? 'Cancel' : 'Add Stream'}
            </button>

            {showForm && (
                <div style={{ ...card, marginBottom: '14px' }}>
                    {error && (
                        <div style={{
                            background: '#fff0f0',
                            color: '#e53e3e',
                            fontSize: '0.8rem',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            marginBottom: '12px'
                        }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <div>
                                <label style={labelStyle}>Year</label>
                                <input
                                    type="number"
                                    value={form.year}
                                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                                    style={{ ...inputStyle }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Batch</label>
                                <select
                                    value={form.batch}
                                    onChange={e => setForm({ ...form, batch: e.target.value })}
                                    style={{ ...inputStyle, appearance: 'none', height: '44px' }}
                                >
                                    {['A', 'B', 'C'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Stream</label>
                                <select
                                    value={form.stream}
                                    onChange={e => setForm({ ...form, stream: parseInt(e.target.value) })}
                                    style={{ ...inputStyle, appearance: 'none', height: '44px' }}
                                >
                                    {[1, 2].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <label style={labelStyle}>Call-up Date</label>
                        <input
                            type="date"
                            value={form.callup_date}
                            onChange={e => setForm({ ...form, callup_date: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Service End Date</label>
                        <input
                            type="date"
                            value={form.service_end}
                            onChange={e => setForm({ ...form, service_end: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading ? '#c2e0cf' : '#008751',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '13px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            {loading ? 'Creating...' : 'Add Stream'}
                        </button>
                    </form>
                </div>
            )}

            <div style={sectionHead}>All Streams</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {streams.map(stream => (
                    <div
                        key={stream.id}
                        style={{
                            ...card,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: 0
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '3px' }}>
                                {stream.year} Batch {stream.batch} Stream {stream.stream}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                {stream.callup_date} → {stream.service_end}
                            </div>
                        </div>
                        <button
                            onClick={() => onToggle(stream.id)}
                            style={{
                                background: stream.is_active ? '#e6f4ee' : '#f2f4f7',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: stream.is_active ? '#008751' : '#8fa396',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {stream.is_active
                                ? <><ToggleRight size={14} color="#008751" /> Active</>
                                : <><ToggleLeft size={14} color="#8fa396" /> Inactive</>
                            }
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}

// ── SETTINGS TAB ──────────────────────────────────
function SettingsTab({ regStatus, card, sectionHead, onToggle }) {
    const [toggling, setToggling] = useState(false)
    const [error, setError] = useState('')

    const handleToggle = async () => {
        setToggling(true)
        setError('')
        try {
            await onToggle()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle registration')
        } finally {
            setToggling(false)
        }
    }

    return (
        <>
            <div style={sectionHead}>Registration</div>

            {error && (
                <div style={{
                    background: '#fff0f0',
                    color: '#e53e3e',
                    fontSize: '0.8rem',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '12px'
                }}>
                    {error}
                </div>
            )}

            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '3px' }}>
                            Member Registration
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            {regStatus?.registration_open
                                ? 'New members can currently register'
                                : 'Registration is closed'
                            }
                        </div>
                    </div>
                    <div style={{
                        background: regStatus?.registration_open ? '#e6f4ee' : '#f2f4f7',
                        color: regStatus?.registration_open ? '#008751' : '#8fa396',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px'
                    }}>
                        {regStatus?.registration_open ? 'Open' : 'Closed'}
                    </div>
                </div>

                {/* ACTIVE STREAMS */}
                {regStatus?.active_streams?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Active Streams
                        </div>
                        {regStatus.active_streams.map(s => (
                            <div key={s.id} style={{
                                fontSize: '0.78rem',
                                color: '#4a5e52',
                                padding: '4px 0',
                                borderBottom: '1px solid #f2f4f7'
                            }}>
                                {s.year} Batch {s.batch} Stream {s.stream}
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleToggle}
                    disabled={toggling}
                    style={{
                        width: '100%',
                        background: regStatus?.registration_open ? '#fff0f0' : '#008751',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '13px',
                        cursor: toggling ? 'not-allowed' : 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: regStatus?.registration_open ? '#e53e3e' : 'white',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {regStatus?.registration_open
                        ? <><ToggleLeft size={16} color="#e53e3e" /> Close Registration</>
                        : <><ToggleRight size={16} color="white" /> Open Registration</>
                    }
                </button>
            </div>
        </>
    )
}