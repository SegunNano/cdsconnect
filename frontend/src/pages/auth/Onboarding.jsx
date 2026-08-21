import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { Shield, Fingerprint, X } from 'lucide-react'
import { registerDevice } from '../../services/webauthn'
import { getMyProfile } from '../../services/members.service'
import { replace } from 'react-router-dom'

export default function Onboarding() {
    const { member, completeOnboarding, logout } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState('intro')
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
                navigate('/', {replace: true})
            }, 2000)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to register passkey')
            setStep('error')
        }
    }

    const handleCancel = () => {
        // Logging out is the only way out
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

                {step === 'intro' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#008751',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                boxShadow: '0 8px 32px rgba(0,135,81,0.3)'
                            }}>
                                <Shield size={36} color="white" />
                            </div>
                            <h1 style={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: '#0d1b12',
                                marginBottom: '8px'
                            }}>
                                One last step
                            </h1>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#8fa396',
                                lineHeight: 1.6
                            }}>
                                Hi {member?.first_name}, you must bind this device to your account before you can continue. This ensures only you can access your account.
                            </p>
                        </div>

                        <div style={{
                            background: '#ffffff',
                            borderRadius: '18px',
                            padding: '20px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            marginBottom: '16px'
                        }}>
                            {[
                                {
                                    icon: '🔐',
                                    title: 'No passwords needed',
                                    desc: 'Use your fingerprint or face ID to log in instantly'
                                },
                                {
                                    icon: '📱',
                                    title: 'Locked to this device',
                                    desc: 'Your account can only be accessed from this phone'
                                },
                                {
                                    icon: '⚡',
                                    title: 'Fast and secure',
                                    desc: 'Cryptographically secure — cannot be stolen or faked'
                                }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        paddingBottom: i < 2 ? '14px' : 0,
                                        marginBottom: i < 2 ? '14px' : 0,
                                        borderBottom: i < 2 ? '1px solid #f2f4f7' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: '#e6f4ee',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: '#0d1b12',
                                            marginBottom: '2px'
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#8fa396',
                                            lineHeight: 1.5
                                        }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MANDATORY NOTE */}
                        <div style={{
                            background: '#fff8e6',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            marginBottom: '16px',
                            fontSize: '0.75rem',
                            color: '#d4900a',
                            fontWeight: 500,
                            lineHeight: 1.5
                        }}>
                            ⚠️ This step is mandatory. You cannot access the platform without binding your device.
                        </div>

                        <button
                            onClick={handleRegisterPasskey}
                            style={{
                                width: '100%',
                                background: '#008751',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                marginBottom: '12px',
                                boxShadow: '0 4px 20px rgba(0,135,81,0.3)'
                            }}
                        >
                            <Fingerprint size={20} color="white" />
                            Bind This Device
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
                                fontWeight: 500,
                                color: '#8fa396',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            Cancel — sign out
                        </button>
                    </>
                )}

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