import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Award, FileText, CheckCircle } from 'lucide-react'
import api from '../../services/api'

// Moved outside the component to prevent re-render issues and purity warnings
const downloadCert = async (type, memberId) => {
    try {
        const response = await api.get(`/certificates/download/${type}?memberId=${memberId}`, {
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement('a')
        a.href = url
        a.setAttribute('download', `certificate-${type}-${Date.now()}.pdf`)
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
    } catch (err) {
        console.error('Download failed:', err)
        alert('Failed to download certificate. Please try again.')
    }
}

export default function CertificateCollate() {
    const navigate = useNavigate()
    const [streams, setStreams] = useState([])
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(null)

    useEffect(() => {
        api.get('/certificates/collate')
            .then(res => setStreams(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const markDone = async (streamId) => {
        if (!window.confirm('Mark this batch as fully distributed? The tab will disappear once all batches are done.')) return
        setMarking(streamId)
        try {
            await api.patch(`/certificates/collate/${streamId}/done`)
            setStreams(prev => prev.filter(s => s.stream_id !== streamId))
        } catch (err) {
            console.error(err)
        } finally {
            setMarking(null)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '100px'
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
                    onClick={() => navigate('/')}
                    style={{
                        width: '36px', height: '36px',
                        background: '#f2f4f7', borderRadius: '50%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                        Certificate Collection
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        Download and print for members
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', padding: '40px 0', fontSize: '0.82rem' }}>
                        Loading...
                    </div>
                )}

                {!loading && streams.length === 0 && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '40px 20px', textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <CheckCircle size={32} color="#c2e0cf" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                            All done
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                            No pending certificate distributions
                        </div>
                    </div>
                )}

                {streams.map(stream => (
                    <div key={stream.stream_id} style={{ marginBottom: '24px' }}>
                        {/* STREAM HEADER */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '10px'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                    {stream.stream_year} Batch {stream.stream_batch} Stream {stream.stream_number}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                    {stream.members.length} paid · {stream.members.filter(m => m.is_exco).length} excos
                                </div>
                            </div>
                            <button
                                onClick={() => markDone(stream.stream_id)}
                                disabled={marking === stream.stream_id}
                                style={{
                                    background: '#e6f4ee', border: 'none',
                                    borderRadius: '8px', padding: '6px 12px',
                                    cursor: 'pointer', fontSize: '0.7rem',
                                    fontWeight: 600, color: '#008751',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    opacity: marking === stream.stream_id ? 0.6 : 1
                                }}
                            >
                                {marking === stream.stream_id ? 'Marking...' : 'Mark Done'}
                            </button>
                        </div>

                        {/* MEMBER LIST */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stream.members.map(m => (
                                <div key={m.id} style={{
                                    background: '#ffffff', borderRadius: '12px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        gap: '10px', marginBottom: '10px'
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px',
                                            background: m.is_exco ? '#fffbf0' : '#e6f4ee',
                                            borderRadius: '10px',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.72rem', fontWeight: 700,
                                            color: m.is_exco ? '#b8860b' : '#008751',
                                            flexShrink: 0
                                        }}>
                                            {m.first_name[0]}{m.last_name[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 600,
                                                color: '#0d1b12', marginBottom: '2px'
                                            }}>
                                                {m.first_name} {m.last_name}
                                                {m.is_exco && (
                                                    <span style={{
                                                        background: '#fffbf0', color: '#b8860b',
                                                        fontSize: '0.6rem', fontWeight: 700,
                                                        padding: '2px 6px', borderRadius: '6px',
                                                        marginLeft: '6px'
                                                    }}>
                                                        {m.role.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                                {m.state_code}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DOWNLOAD BUTTONS */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => downloadCert('membership', m.id)}
                                            style={{
                                                flex: 1, background: '#e6f4ee',
                                                border: 'none', borderRadius: '8px',
                                                padding: '9px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: '5px',
                                                fontSize: '0.72rem', fontWeight: 600,
                                                color: '#008751',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <FileText size={13} color="#008751" />
                                            Membership
                                        </button>

                                        {m.is_exco && (
                                            <button
                                                onClick={() => downloadCert('excellence', m.id)}
                                                style={{
                                                    flex: 1, background: '#fffbf0',
                                                    border: 'none', borderRadius: '8px',
                                                    padding: '9px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', gap: '5px',
                                                    fontSize: '0.72rem', fontWeight: 600,
                                                    color: '#b8860b',
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                                }}
                                            >
                                                <Award size={13} color="#b8860b" />
                                                Excellence
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}