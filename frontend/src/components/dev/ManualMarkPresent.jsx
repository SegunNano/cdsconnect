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
        let isMounted = true
        api.get('/meetings')
            .then(res => {
                if (isMounted) setMeetings(res.data?.data || [])
            })
            .catch(err => {
                if (isMounted) setError(err.response?.data?.message || 'Failed to fetch meetings')
            })

        return () => { isMounted = false }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/attendance/mark-present', {
                memberId: member.id,
                meetingId: parseInt(meetingId, 10),
                reason
            })
            setSuccess(true)
            setTimeout(() => {
                if (onSuccess) onSuccess()
            }, 1000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark present')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{
                background: '#e6f4ee',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#008751',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <UserCheck size={16} color="#008751" />
                {member.first_name} marked present successfully!
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {error && (
                <div style={{
                    background: '#fff0f0',
                    color: '#e53e3e',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px'
                }}>
                    {error}
                </div>
            )}

            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#4a5e52',
                    marginBottom: '4px'
                }}>
                    Select Meeting
                </label>
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
                        boxSizing: 'border-box'
                    }}
                >
                    <option value="" disabled>Select meeting</option>
                    {meetings.map(m => (
                        <option key={m.id} value={m.id} style={{ color: '#0d1b12' }}>
                            {m.title} — {m.meeting_date}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#4a5e52',
                    marginBottom: '4px'
                }}>
                    Reason / Approval Note
                </label>
                <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Executive duty exemption"
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
                        boxSizing: 'border-box'
                    }}
                />
            </div>

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
                    justify: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'white',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginTop: '4px'
                }}
            >
                <UserCheck size={14} color="white" />
                {loading ? 'Marking...' : 'Confirm Mark Present'}
            </button>
        </form>
    )
}