import { useState, useEffect } from 'react'
import { UserCheck } from 'lucide-react'
import api from '../../services/api'

export default function ManualMarkPresent({ member, onSuccess }) {
    const [meetings, setMeetings] = useState([])
    const [meetingId, setMeetingId] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        api.get('/meetings').then(res => {
            setMeetings(res.data.data)
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/attendance/mark-present', {
                memberId: member.id,
                meetingId: parseInt(meetingId),
                reason
            })
            setSuccess(true)
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark present')
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <div style={{
            background: '#e6f4ee',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#008751',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            <UserCheck size={14} color="#008751" />
            {member.first_name} marked present
        </div>
    )

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    background: '#fff0f0',
                    color: '#e53e3e',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                }}>
                    {error}
                </div>
            )}

            <select
                value={meetingId}
                onChange={e => setMeetingId(e.target.value)}
                required
                style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #e8ece9',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    color: meetingId ? '#0d1b12' : '#8fa396',
                    outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginBottom: '8px',
                    appearance: 'none'
                }}
            >
                <option value="">Select meeting</option>
                {meetings.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.title} — {m.meeting_date}
                    </option>
                ))}
            </select>

            <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Coordinator approved — reason"
                required
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
                    marginBottom: '8px'
                }}
            />

            <button
                type="submit"
                disabled={loading}
                style={{
                    width: '100%',
                    background: loading ? '#c2e0cf' : '#008751',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'white',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
            >
                <UserCheck size={14} color="white" />
                {loading ? 'Marking...' : 'Mark Present'}
            </button>
        </form>
    )
}