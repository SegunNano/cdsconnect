import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, Search } from 'lucide-react'
import api from '../../services/api'

export default function SignOutPanel() {
    const navigate = useNavigate()
    const [meeting, setMeeting] = useState(null)
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [confirming, setConfirming] = useState(null)
    const [form, setForm] = useState({ name: '', stateCode: '' })
    const [error, setError] = useState('')
    const [signingOut, setSigningOut] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const todayRes = await api.get('/signout/today')
                if (todayRes.data.data) {
                    const meetingId = todayRes.data.data.id
                    setMeeting(todayRes.data.data)
                    const listRes = await api.get(`/signout/list/${meetingId}`)
                    setAttendance(listRes.data.data.attendance)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleConfirmSignOut = async (attendanceRecord) => {
        setSigningOut(true)
        setError('')
        try {
            await api.post('/signout/confirm', {
                meetingId: meeting.id,
                attendanceId: attendanceRecord.id,
                confirmedName: form.name,
                confirmedStateCode: form.stateCode
            })
            setAttendance(prev => prev.map(a =>
                a.id === attendanceRecord.id
                    ? { ...a, signed_out_at: new Date().toISOString() }
                    : a
            ))
            setConfirming(null)
            setForm({ name: '', stateCode: '' })
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed')
        } finally {
            setSigningOut(false)
        }
    }

    const pending = attendance.filter(a => !a.signed_out_at)
    const cleared = attendance.filter(a => a.signed_out_at)

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#8fa396'
            }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '40px'
        }}>

            {/* HEADER */}
            <div style={{
                background: '#ffffff',
                padding: '52px 20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div
                    onClick={() => navigate('/dashboard')}
                    style={{
                        width: '36px',
                        height: '36px',
                        background: '#f2f4f7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Sign Out Panel</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        {meeting ? meeting.title : 'No meeting today'}
                    </div>
                </div>
            </div>

            {!meeting && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8fa396', fontSize: '0.88rem' }}>
                    No meeting scheduled for today
                </div>
            )}

            {meeting && (
                <div style={{ padding: '16px 20px 0' }}>

                    {/* STATS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                        }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                                Pending
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d4900a' }}>
                                {pending.length}
                            </div>
                        </div>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                        }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                                Cleared
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#008751' }}>
                                {cleared.length}
                            </div>
                        </div>
                    </div>

                    {/* CONFIRM MODAL */}
                    {confirming && (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '18px',
                            padding: '20px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            marginBottom: '14px',
                            border: '2px solid #008751'
                        }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '4px' }}>
                                Verify Member — No. {confirming.sequence_number}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#8fa396', marginBottom: '16px' }}>
                                Ask member to state their name and state code
                            </div>

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

                            <div style={{ marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => { setForm({ ...form, name: e.target.value }); setError('') }}
                                    placeholder="Full name as stated by member"
                                    style={{
                                        width: '100%',
                                        background: '#f2f4f7',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        marginBottom: '8px'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={form.stateCode}
                                    onChange={e => { setForm({ ...form, stateCode: e.target.value.toUpperCase() }); setError('') }}
                                    placeholder="State code"
                                    style={{
                                        width: '100%',
                                        background: '#f2f4f7',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button
                                    onClick={() => { setConfirming(null); setForm({ name: '', stateCode: '' }); setError('') }}
                                    style={{
                                        background: '#f2f4f7',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        color: '#4a5e52',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirmSignOut(confirming)}
                                    disabled={signingOut || !form.name || !form.stateCode}
                                    style={{
                                        background: '#008751',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        cursor: signingOut ? 'not-allowed' : 'pointer',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        color: 'white',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                >
                                    {signingOut ? 'Verifying...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ATTENDANCE LIST */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                        Sign-in List
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {attendance.map(record => (
                            <div
                                key={record.id}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: record.signed_out_at ? 0.6 : 1
                                }}
                            >
                                {/* SEQUENCE NUMBER */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: record.signed_out_at ? '#e6f4ee' : '#f2f4f7',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    color: record.signed_out_at ? '#008751' : '#0d1b12',
                                    flexShrink: 0
                                }}>
                                    {record.sequence_number}
                                </div>

                                {/* INFO */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                        {record.first_name} {record.last_name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                        {record.state_code}
                                        {record.is_late ? ' · Late' : ''}
                                    </div>
                                </div>

                                {/* ACTION */}
                                {record.signed_out_at ? (
                                    <CheckCircle size={20} color="#008751" />
                                ) : (
                                    <button
                                        onClick={() => { setConfirming(record); setError('') }}
                                        disabled={!!confirming}
                                        style={{
                                            background: '#008751',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            cursor: confirming ? 'not-allowed' : 'pointer',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            color: 'white',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            opacity: confirming ? 0.5 : 1
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}