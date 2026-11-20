import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { formatDate } from '../../utils/dates'
import Toast from '../../components/common/Toast'
import { FONT, card, btn } from '../../components/tokens/styles'

const roleLabel = (r) => r.replace(/_/g, ' ')

export default function CertificateCollate() {
    const navigate = useNavigate()
    const [streams, setStreams] = useState([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState('')
    const [toast, setToast] = useState(null)

    useEffect(() => {
        api.get('/certificates/collate')
            .then(res => setStreams(res.data.data))
            .catch(() => setToast({ type: 'error', text: 'Could not load the list.' }))
            .finally(() => setLoading(false))
    }, [])

    const downloadList = async (s) => {
        setBusy(`pdf-${s.stream_id}`)
        try {
            const res = await api.get(`/certificates/collate/${s.stream_id}/pdf`, { responseType: 'blob' })
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = `paid-certificates-${s.stream_year}-${s.stream_batch}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch {
            setToast({ type: 'error', text: 'Could not download the list.' })
        } finally {
            setBusy('')
        }
    }

    const markDone = async (s) => {
        if (!window.confirm(
            'Close this batch? Nobody in it can pay for a certificate after this, and it leaves this tab. Download the list first.'
        )) return
        setBusy(`done-${s.stream_id}`)
        try {
            await api.patch(`/certificates/collate/${s.stream_id}/done`)
            setStreams(prev => prev.filter(x => x.stream_id !== s.stream_id))
        } catch {
            setToast({ type: 'error', text: 'Could not close the batch.' })
        } finally {
            setBusy('')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f2f4f7', fontFamily: FONT, maxWidth: '390px', margin: '0 auto', paddingBottom: '100px' }}>
            <Toast message={toast?.text} type={toast?.type} onClose={() => setToast(null)} />

            <div style={{ background: '#ffffff', padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 0 #e8ece9' }}>
                <div onClick={() => navigate('/')} style={{ width: '36px', height: '36px', background: '#f2f4f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Certificates</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Members who have paid</div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>
                <div style={{ ...card, background: '#f8fdf9', fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6, marginBottom: '16px' }}>
                    Certificates are issued by hand for now. Members pay in the app, and this is the list to work from.
                    Every member gets a certificate of membership, and excos also get a certificate of excellence.
                </div>

                {loading && <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>Loading...</div>}

                {!loading && streams.length === 0 && (
                    <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
                        <CheckCircle size={32} color="#c2e0cf" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>No payments yet</div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>Members who pay will appear here.</div>
                    </div>
                )}

                {streams.map(s => {
                    const excos = s.members.filter(m => m.is_exco).length
                    return (
                        <div key={s.stream_id} style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0d1b12' }}>
                                {s.stream_year} Batch {s.stream_batch} Stream {s.stream_number}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#8fa396', margin: '2px 0 10px' }}>
                                {s.members.length} paid · {s.members.length} membership · {excos} excellence
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <button onClick={() => downloadList(s)} disabled={!!busy} style={btn('#008751', 'white', !!busy)}>
                                    <Download size={14} /> {busy === `pdf-${s.stream_id}` ? 'Preparing...' : 'Download list'}
                                </button>
                                <button onClick={() => markDone(s)} disabled={!!busy} style={btn('#e6f4ee', '#008751', !!busy)}>
                                    {busy === `done-${s.stream_id}` ? 'Closing...' : 'Mark done'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {s.members.map((m, i) => (
                                    <div key={m.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px' }}>
                                        <span style={{ width: '22px', fontSize: '0.72rem', fontWeight: 700, color: '#8fa396' }}>{i + 1}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12' }}>
                                                {m.first_name} {m.last_name}
                                                {m.is_exco && (
                                                    <span style={{ background: '#fffbf0', color: '#b8860b', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', marginLeft: '6px', textTransform: 'uppercase' }}>
                                                        {roleLabel(m.role)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>{m.state_code} · paid {formatDate(m.paid_at)}</div>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.is_exco ? '#b8860b' : '#008751', whiteSpace: 'nowrap' }}>
                                            {m.is_exco ? '2 certificates' : '1 certificate'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}