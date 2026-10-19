import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Award, FileText, AlertCircle, Coins, FileCheck } from 'lucide-react'
import api from '../../services/api'
import { RATE } from '../../constants'

export default function ClearanceSlip() {
    const navigate = useNavigate()
    const [clearances, setClearances] = useState([])
    const [certStatus, setCertStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [payError, setPayError] = useState('')
    const [paySuccess, setPaySuccess] = useState(false)
    const [downloading, setDownloading] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clearanceRes, certRes] = await Promise.all([
                    api.get('/clearance/me'),
                    api.get('/certificates/status')
                ])
                setClearances(clearanceRes.data.data)
                setCertStatus(certRes.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handlePay = async () => {
        setPaying(true)
        setPayError('')
        try {
            await api.post('/certificates/pay')
            setPaySuccess(true)
            const certRes = await api.get('/certificates/status')
            setCertStatus(certRes.data.data)
        } catch (err) {
            setPayError(err.response?.data?.message || 'Payment failed')
        } finally {
            setPaying(false)
        }
    }

    // Fixed certificate download using axios blob response
    const downloadCert = async (type, memberId = null) => {
        try {
            const memberParam = memberId ? `?memberId=${memberId}` : ''
            const response = await api.get(`/certificates/download/${type}${memberParam}`, {
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

    // Fixed monthly clearance slip download using axios blob response
    const handleDownloadSlip = async (meetingId, meetingTitle) => {
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
            alert('Failed to download clearance slip.')
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
                    onClick={() => navigate('/dashboard')}
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
                        Clearance & Certificates
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        Monthly clearance slips and final certificates
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* CERTIFICATE SECTION */}
                {certStatus && certStatus.certificate_unlocked && (
                    <>
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                            textTransform: 'uppercase', letterSpacing: '0.8px',
                            marginBottom: '10px'
                        }}>
                            Final Certificates
                        </div>

                        {/* NOT PAID YET */}
                        {!certStatus.has_paid && !paySuccess && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '20px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                marginBottom: '16px',
                                border: '2px solid #e6f4ee'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        background: '#e6f4ee', borderRadius: '14px',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <Award size={24} color="#008751" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '2px' }}>
                                            Certificates Available
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                                            {certStatus.stream_year} Batch {certStatus.stream_batch} Stream {certStatus.stream_number}
                                        </div>
                                    </div>
                                </div>

                                {/* WHAT THEY GET */}
                                <div style={{
                                    background: '#f8fdf9', borderRadius: '12px',
                                    padding: '12px 14px', marginBottom: '14px'
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                        You will receive
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0d1b12' }}>
                                            <FileText size={14} color="#008751" />
                                            Certificate of Membership
                                        </div>
                                        {certStatus.is_exco && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0d1b12' }}>
                                                <Award size={14} color="#b8860b" />
                                                Certificate of Excellence
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {payError && (
                                    <div style={{
                                        background: '#fff0f0', color: '#e53e3e',
                                        fontSize: '0.78rem', padding: '10px 12px',
                                        borderRadius: '10px', marginBottom: '12px',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <AlertCircle size={14} color="#e53e3e" />
                                        {payError}
                                    </div>
                                )}

                                {/* COST */}
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '14px'
                                }}>
                                    <div style={{ fontSize: '0.82rem', color: '#4a5e52' }}>
                                        Cost
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Coins size={14} color="#d4900a" />
                                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d4900a' }}>
                                            {certStatus.certificate_cost_tokens} token{certStatus.certificate_cost_tokens !== 1 ? 's' : ''}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                            (₦{(certStatus.certificate_cost_tokens * RATE).toLocaleString()})
                                        </span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#8fa396', marginBottom: '14px', textAlign: 'center' }}>
                                    Current balance: {certStatus.token_balance} token{certStatus.token_balance !== 1 ? 's' : ''}
                                    {certStatus.token_balance < certStatus.certificate_cost_tokens && (
                                        <span style={{ color: '#e53e3e', display: 'block', marginTop: '2px' }}>
                                            Insufficient tokens — contact treasurer to top up
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={handlePay}
                                    disabled={paying || certStatus.token_balance < certStatus.certificate_cost_tokens}
                                    style={{
                                        width: '100%',
                                        background: paying || certStatus.token_balance < certStatus.certificate_cost_tokens
                                            ? '#c2e0cf' : '#008751',
                                        border: 'none', borderRadius: '12px',
                                        padding: '14px', cursor: paying || certStatus.token_balance < certStatus.certificate_cost_tokens
                                            ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem', fontWeight: 700,
                                        color: 'white',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                >
                                    {paying ? 'Processing...' : `Pay ${certStatus.certificate_cost_tokens} Token${certStatus.certificate_cost_tokens !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}

                        {/* PAID — DOWNLOAD */}
                        {(certStatus.has_paid || paySuccess) && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '20px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Award size={20} color="#008751" />
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                                        Your Certificates
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* MEMBERSHIP CERT */}
                                    <div style={{
                                        background: '#f8fdf9', borderRadius: '12px',
                                        padding: '14px', display: 'flex',
                                        alignItems: 'center', gap: '12px'
                                    }}>
                                        <FileText size={20} color="#008751" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                                Certificate of Membership
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadCert('membership')}
                                            style={{
                                                background: '#008751', border: 'none',
                                                borderRadius: '8px', padding: '8px 12px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', gap: '4px',
                                                fontSize: '0.72rem', fontWeight: 600,
                                                color: 'white',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <Download size={13} color="white" />
                                            Download
                                        </button>
                                    </div>

                                    {/* EXCELLENCE CERT — excos only */}
                                    {certStatus.is_exco && (
                                        <div style={{
                                            background: '#fffbf0', borderRadius: '12px',
                                            padding: '14px', display: 'flex',
                                            alignItems: 'center', gap: '12px'
                                        }}>
                                            <Award size={20} color="#b8860b" />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                                    Certificate of Excellence
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadCert('excellence')}
                                                style={{
                                                    background: '#b8860b', border: 'none',
                                                    borderRadius: '8px', padding: '8px 12px',
                                                    cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', gap: '4px',
                                                    fontSize: '0.72rem', fontWeight: 600,
                                                    color: 'white',
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                                }}
                                            >
                                                <Download size={13} color="white" />
                                                Download
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* CLEARANCE SLIPS */}
                <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                    marginBottom: '10px',
                    marginTop: certStatus?.certificate_unlocked ? '16px' : '0'
                }}>
                    Monthly Clearance Slips
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '20px 0' }}>
                        Loading...
                    </div>
                )}

                {!loading && clearances.length === 0 && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '40px 20px', textAlign: 'center',
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

                {!loading && clearances.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {clearances.map(slip => {
                            const meetingDate = new Date(slip.meeting_date)
                            const month = meetingDate.toLocaleString('default', {
                                month: 'long', year: 'numeric', timeZone: 'UTC'
                            })

                            return (
                                <div key={slip.id} style={{
                                    background: '#ffffff', borderRadius: '14px',
                                    padding: '16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        background: '#e6f4ee', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0
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
                                        onClick={() => handleDownloadSlip(slip.meeting_id, slip.meeting_title)}
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