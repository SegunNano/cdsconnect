import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FilePlus } from 'lucide-react'
import api from '../../services/api'

export default function ExcuseForm() {
    const navigate = useNavigate()
    const [meetings, setMeetings] = useState([])
    const [form, setForm] = useState({ meetingId: '', reason: '' })
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const result = await api.get('/meetings')
                // Only show future meetings
                const upcoming = result.data.data.filter(m => {
                    const signInOpen = new Date(m.sign_in_open)
                    return signInOpen > new Date()
                })
                setMeetings(upcoming)
            } catch (err) {
                console.error(err)
            }
        }
        fetchMeetings()
    }, [])

    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        if (selected) setFile(selected)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            setError('Evidence is required')
            return
        }
        setLoading(true)
        setError('')

        try {
            // Upload evidence first
            setUploading(true)
            const formData = new FormData()
            formData.append('evidence', file)
            const uploadResult = await api.post('/excuses/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setUploading(false)

            const evidenceUrl = uploadResult.data.data.url

            // Submit excuse
            await api.post('/excuses', {
                meetingId: parseInt(form.meetingId),
                reason: form.reason,
                evidenceUrl
            })

            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '0.88rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px'
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
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>File Excuse</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Must be before sign-in opens</div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>

                {success ? (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <FilePlus size={32} color="#008751" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12', marginBottom: '4px' }}>
                            Excuse Filed
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#8fa396' }}>
                            Awaiting coordinator review
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '24px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        {error && (
                            <div style={{
                                background: '#fff0f0',
                                color: '#e53e3e',
                                fontSize: '0.8rem',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                fontWeight: 500
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* MEETING SELECT */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Meeting</label>
                                <select
                                    value={form.meetingId}
                                    onChange={e => setForm({ ...form, meetingId: e.target.value })}
                                    required
                                    style={{
                                        ...inputStyle,
                                        appearance: 'none',
                                        height: '48px',
                                        color: form.meetingId ? '#0d1b12' : '#8fa396'
                                    }}
                                >
                                    <option value="">Select meeting</option>
                                    {meetings.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.title} — {m.meeting_date}
                                        </option>
                                    ))}
                                </select>
                                {meetings.length === 0 && (
                                    <div style={{ fontSize: '0.72rem', color: '#8fa396', marginTop: '6px' }}>
                                        No upcoming meetings available
                                    </div>
                                )}
                            </div>

                            {/* REASON */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Reason</label>
                                <textarea
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Explain your reason for absence..."
                                    required
                                    rows={4}
                                    style={{
                                        ...inputStyle,
                                        resize: 'none',
                                        lineHeight: 1.6
                                    }}
                                />
                            </div>

                            {/* EVIDENCE UPLOAD */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Evidence (Required)</label>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: '#f2f4f7',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    border: file ? '2px solid #008751' : '2px dashed #c2e0cf'
                                }}>
                                    <Upload size={18} color={file ? '#008751' : '#8fa396'} />
                                    <span style={{
                                        fontSize: '0.82rem',
                                        color: file ? '#008751' : '#8fa396',
                                        fontWeight: file ? 600 : 400
                                    }}>
                                        {file ? file.name : 'Tap to upload document or image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: loading ? '#c2e0cf' : '#008751',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                {uploading ? 'Uploading evidence...' : loading ? 'Submitting...' : 'Submit Excuse'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}