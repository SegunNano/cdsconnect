import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Fingerprint, X } from 'lucide-react'
import { registerDevice } from '../../services/webauthn'
import { getMyProfile } from '../../services/members.service'

export default function Onboarding() {
    const { completeOnboarding, logout } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState('registering')
    const [error, setError] = useState('')

    const handleRegisterPasskey = async () => {
        setStep('registering')
        setError('')
        try {
            await registerDevice()
            const memberRes = await getMyProfile()
            const updatedMember = memberRes.data

            setStep('success')
            setTimeout(() => {
                completeOnboarding(updatedMember)
                navigate('/', { replace: true })
            }, 2000)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to register passkey')
            setStep('error')
        }
    }

    const hasRunRef = useRef(false)
    
    useEffect(() => {
        // Prevent double execution during React 18 Strict Mode
        if (hasRunRef.current) return
        hasRunRef.current = true
    
        handleRegisterPasskey()
    }, [])

    const handleCancel = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            maxWidth: '390px',
            margin: '0 auto'
        }}>
            <div style={{ width: '100%' }}>

                {step === 'registering' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#e6f4ee',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            <Fingerprint size={36} color="#008751" />
                        </div>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.7; transform: scale(0.95); }
                            }
                        `}</style>
                        <h2 style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#0d1b12',
                            marginBottom: '8px'
                        }}>
                            Follow the prompt
                        </h2>
                        <p style={{
                            fontSize: '0.82rem',
                            color: '#8fa396',
                            lineHeight: 1.6
                        }}>
                            Your device will ask you to authenticate with your fingerprint, face ID, or PIN to create the passkey.
                        </p>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#e6f4ee',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <span style={{ fontSize: '2.5rem' }}>✅</span>
                        </div>
                        <h2 style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#0d1b12',
                            marginBottom: '8px'
                        }}>
                            Device bound successfully
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#8fa396' }}>
                            Taking you to your dashboard...
                        </p>
                    </div>
                )}

                {step === 'error' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#fff0f0',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <X size={36} color="#e53e3e" />
                        </div>
                        <h2 style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#0d1b12',
                            marginBottom: '8px'
                        }}>
                            Binding failed
                        </h2>
                        <p style={{
                            fontSize: '0.82rem',
                            color: '#8fa396',
                            marginBottom: '24px',
                            lineHeight: 1.6
                        }}>
                            {error || 'Could not bind your device. Please try again.'}
                        </p>

                        <button
                            onClick={handleRegisterPasskey}
                            style={{
                                width: '100%',
                                background: '#008751',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '15px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                marginBottom: '12px'
                            }}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={handleCancel}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                padding: '12px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                color: '#8fa396',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            Cancel — sign out
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}