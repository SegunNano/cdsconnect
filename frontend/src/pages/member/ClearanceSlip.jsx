import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileCheck } from 'lucide-react'
import api from '../../services/api'

export default function ClearanceSlip() {
    const navigate = useNavigate()
    const [slips, setSlips] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await api.get('/clearance/me')
                setSlips(result.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleDownload = async (meetingId, meetingTitle) => {
        setDownloading(meetingId)
        try {
            const response = await api.get(`/clearance/download/${meetingId}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `clearance_${meetingTitle}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error(err)
        } finally {
            setDownloading(null)
        }
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
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Clearance Slips</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Download your monthly clearance</div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', marginTop: '40px' }}>
                        Loading...
                    </div>
                )}

                {!loading && slips.length === 0 && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <FileCheck size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                            No clearance slips yet
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                            Slips appear after you are cleared for a meeting
                        </div>
                    </div>
                )}

                {!loading && slips.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {slips.map(slip => {
                            const meetingDate = new Date(slip.meeting_date)
                            const month = meetingDate.toLocaleString('default', {
                                month: 'long',
                                year: 'numeric',
                                timeZone: 'UTC'
                            })

                            return (
                                <div
                                    key={slip.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        padding: '16px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        background: '#e6f4ee',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FileCheck size={20} color="#008751" />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                            {slip.meeting_title}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                            {month}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(slip.meeting_id, slip.meeting_title)}
                                        disabled={downloading === slip.meeting_id}
                                        style={{
                                            background: downloading === slip.meeting_id ? '#f2f4f7' : '#e6f4ee',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '8px 12px',
                                            cursor: downloading === slip.meeting_id ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            color: '#008751',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                                        }}
                                    >
                                        <Download size={14} color="#008751" />
                                        {downloading === slip.meeting_id ? '...' : 'PDF'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}