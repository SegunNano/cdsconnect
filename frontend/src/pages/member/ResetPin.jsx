import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import PinInput from '../../components/common/PinInput'
import api from '../../services/api'

export default function ResetPin() {
    const navigate = useNavigate()
    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPin.length < 4) {
            setError('PIN must be at least 4 digits')
            return
        }
        if (newPin !== confirmPin) {
            setError('PINs do not match')
            return
        }
        setLoading(true)
        setError('')

        try {
            await api.patch('/pin/reset', { newPin, confirmPin })
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '12px',
        textAlign: 'center'
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto'
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
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Reset PIN</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Set a new 4-digit PIN</div>
                </div>
            </div>

            <div style={{ padding: '32px 20px' }}>

                {success ? (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <KeyRound size={32} color="#008751" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12', marginBottom: '4px' }}>
                            PIN Updated
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#8fa396' }}>
                            Redirecting to dashboard...
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
                                marginBottom: '20px',
                                fontWeight: 500,
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>New PIN</label>
                                <PinInput
                                    value={newPin}
                                    onChange={(val) => { setNewPin(val); setError('') }}
                                />
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={labelStyle}>Confirm New PIN</label>
                                <PinInput
                                    value={confirmPin}
                                    onChange={(val) => { setConfirmPin(val); setError('') }}
                                />
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
                                {loading ? 'Updating...' : 'Update PIN'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}