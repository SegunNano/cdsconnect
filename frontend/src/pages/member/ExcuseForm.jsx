import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FilePlus, AlertCircle, Clock } from 'lucide-react'
import api from '../../services/api'

export default function ExcuseForm() {
    const navigate = useNavigate()
    const [eligibility, setEligibility] = useState(null)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ reason: '' })
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        api.get('/excuses/eligibility')
            .then(res => setEligibility(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) { setError('Evidence is required'); return }
        setSubmitting(true)
        setError('')
        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('evidence', file)
            const uploadResult = await api.post('/excuses/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setUploading(false)

            await api.post('/excuses', {
                meetingId: eligibility.meeting.id,
                reason: form.reason,
                evidenceUrl: uploadResult.data.data.url
            })

            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSubmitting(false)
            setUploading(false)
        }
    }

    const inputStyle = {
        width: '100%', background: '#f2f4f7', border: 'none',
        borderRadius: '12px', padding: '14px 16px', fontSize: '0.88rem',
        color: '#0d1b12', outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    }

    const labelStyle = {
        display: 'block', fontSize: '0.68rem', fontWeight: 600,
        color: '#4a5e52', textTransform: 'uppercase',
        letterSpacing: '0.8px', marginBottom: '8px'
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px', margin: '0 auto', paddingBottom: '40px'
        }}>
            {/* HEADER */}
            <div style={{
                background: '#ffffff', padding: '52px 20px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div
                    onClick={() => navigate(-1)}
                    style={{
                        width: '36px', height: '36px', background: '#f2f4f7',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                        File Excuse
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        Must be at least 5 working days before the meeting
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', padding: '40px 0', fontSize: '0.82rem' }}>
                        Checking eligibility...
                    </div>
                )}

                {/* NOT ELIGIBLE */}
                {!loading && eligibility && !eligibility.eligible && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '32px 20px', textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <div style={{
                            width: '56px', height: '56px', background: '#fff0f0',
                            borderRadius: '16px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 16px'
                        }}>
                            <AlertCircle size={24} color="#e53e3e" />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
                            Cannot File Excuse
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#8fa396', lineHeight: 1.6, marginBottom: '20px' }}>
                            {eligibility.reason}
                        </div>
                        {eligibility.existing_status && (
                            <div style={{
                                background: eligibility.existing_status === 'approved' ? '#e6f4ee'
                                    : eligibility.existing_status === 'rejected' ? '#fff0f0'
                                    : '#fff8e6',
                                borderRadius: '10px', padding: '10px 14px',
                                fontSize: '0.78rem', fontWeight: 600,
                                color: eligibility.existing_status === 'approved' ? '#008751'
                                    : eligibility.existing_status === 'rejected' ? '#e53e3e'
                                    : '#d4900a'
                            }}>
                                Status: {eligibility.existing_status}
                            </div>
                        )}
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                marginTop: '16px', width: '100%',
                                background: '#f2f4f7', border: 'none',
                                borderRadius: '12px', padding: '13px',
                                cursor: 'pointer', fontSize: '0.88rem',
                                fontWeight: 600, color: '#4a5e52',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            Go Back
                        </button>
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '40px 20px', textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <FilePlus size={32} color="#008751" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12', marginBottom: '4px' }}>
                            Excuse Filed
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#8fa396', marginBottom: '20px' }}>
                            Awaiting coordinator review. Keep checking your notifications.
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                width: '100%', background: '#008751',
                                border: 'none', borderRadius: '12px',
                                padding: '13px', cursor: 'pointer',
                                fontSize: '0.88rem', fontWeight: 700,
                                color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            Back to Home
                        </button>
                    </div>
                )}

                {/* ELIGIBLE — SHOW FORM */}
                {!loading && eligibility?.eligible && !success && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        {/* MEETING INFO */}
                        <div style={{
                            background: '#f8fdf9', borderRadius: '12px',
                            padding: '12px 14px', marginBottom: '20px',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <Clock size={16} color="#008751" />
                            <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12' }}>
                                    {eligibility.meeting.title}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                    {eligibility.meeting.meeting_date} · Cost if approved: 1 token
                                </div>
                            </div>
                        </div>

                        {/* TOKEN BALANCE */}
                        <div style={{
                            fontSize: '0.72rem', color: '#8fa396',
                            marginBottom: '16px', textAlign: 'right'
                        }}>
                            Balance: <strong style={{ color: '#008751' }}>{eligibility.token_balance} tokens</strong>
                        </div>

                        {error && (
                            <div style={{
                                background: '#fff0f0', color: '#e53e3e',
                                fontSize: '0.8rem', padding: '12px 16px',
                                borderRadius: '12px', marginBottom: '16px', fontWeight: 500
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Reason</label>
                                <textarea
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Explain your reason for absence..."
                                    required
                                    rows={4}
                                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Evidence (Required)</label>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: '#f2f4f7', borderRadius: '12px',
                                    padding: '14px 16px', cursor: 'pointer',
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
                                        onChange={e => setFile(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    background: submitting ? '#c2e0cf' : '#008751',
                                    color: 'white', border: 'none',
                                    borderRadius: '12px', padding: '15px',
                                    fontSize: '0.9rem', fontWeight: 700,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                {uploading ? 'Uploading evidence...'
                                    : submitting ? 'Submitting...'
                                    : 'Submit Excuse'
                                }
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}