import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Shield } from 'lucide-react'
import api from '../../services/api'

export default function VerifySlip() {
    const { qrToken } = useParams()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.get(`/clearance/verify/${qrToken}`)
                setResult({ valid: true, data: res.data.data })
            } catch (err) {
                setResult({ valid: false })
            } finally {
                setLoading(false)
            }
        }
        verify()
    }, [qrToken])

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '390px' }}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: '#008751',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        boxShadow: '0 4px 20px rgba(0,135,81,0.3)'
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                        Clearance Verification
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8fa396', marginTop: '4px' }}>
                        NYSC Lagos — InfoTech CDS
                    </div>
                </div>

                {loading && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        color: '#8fa396',
                        fontSize: '0.88rem'
                    }}>
                        Verifying...
                    </div>
                )}

                {!loading && result?.valid && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '24px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        {/* VALID */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#e6f4ee',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '20px'
                        }}>
                            <CheckCircle size={20} color="#008751" />
                            <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#008751' }}>
                                    Authentic Document
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#4a5e52' }}>
                                    This clearance slip is verified
                                </div>
                            </div>
                        </div>

                        {/* MEMBER DETAILS */}
                        {[
                            { label: 'Full Name', value: `${result.data.first_name} ${result.data.last_name}` },
                            { label: 'State Code', value: result.data.state_code },
                            { label: 'Meeting', value: result.data.meeting_title },
                            { label: 'Period', value: new Date(result.data.meeting_date).toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' }) },
                            { label: 'Generated', value: new Date(result.data.generated_at).toLocaleDateString() }
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '10px 0',
                                borderBottom: '1px solid #f2f4f7'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#8fa396', fontWeight: 600 }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12', textAlign: 'right' }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !result?.valid && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px 24px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <XCircle size={40} color="#e53e3e" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12', marginBottom: '6px' }}>
                            Invalid Document
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#8fa396' }}>
                            This clearance slip could not be verified. It may have been altered or is not authentic.
                        </div>
                    </div>
                )}

                <div style={{
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: '#8fa396',
                    marginTop: '16px'
                }}>
                    CDSConnect · InfoTech CDS Lagos
                </div>
            </div>
        </div>
    )
}