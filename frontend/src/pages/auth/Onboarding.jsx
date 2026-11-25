import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check, Download, Fingerprint, Share, X } from 'lucide-react'
import { registerDevice } from '../../services/webauthn'
import { getMyProfile } from '../../services/members.service'

function isStandaloneMode() {
    if (typeof window === 'undefined') return false
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    )
}

function isMobileDevice() {
    if (typeof window === 'undefined') return false
    return (
        window.matchMedia('(pointer: coarse)').matches ||
        /android|iphone|ipad|ipod/i.test(window.navigator.userAgent)
    )
}

function isIosDevice() {
    if (typeof window === 'undefined') return false
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function Onboarding() {
    const { member, completeOnboarding, logout } = useAuth()
    const navigate = useNavigate()

    const [standalone, setStandalone] = useState(isStandaloneMode)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [step, setStep] = useState(() =>
        !isStandaloneMode() && isMobileDevice() ? 'install' : 'idle'
    )
    const [error, setError] = useState('')

    useEffect(() => {
        const media = window.matchMedia('(display-mode: standalone)')

        const syncDisplayMode = () => {
            const nowStandalone = isStandaloneMode()
            setStandalone(nowStandalone)
            if (nowStandalone) {
                setStep((prev) => (prev === 'install' ? 'idle' : prev))
            } else if (isMobileDevice()) {
                setStep((prev) => (prev === 'idle' ? 'install' : prev))
            }
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            syncDisplayMode()
        }

        media.addEventListener?.('change', syncDisplayMode)
        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            media.removeEventListener?.('change', syncDisplayMode)
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return
        setError('')
        deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setDeferredPrompt(null)
    }

    const handleRegisterPasskey = async () => {
        if (!standalone && isMobileDevice()) {
            setStep('install')
            return
        }

        setStep('registering')
        setError('')
        try {
            await registerDevice()
            const memberRes = await getMyProfile()
            const updatedMember = memberRes.data || memberRes

            setStep('success')
            setTimeout(() => {
                completeOnboarding(updatedMember)
                navigate('/', { replace: true })
            }, 1800)
        } catch (err) {
            console.error('Passkey registration error:', err)
            setError(err.response?.data?.message || err.message || 'Failed to register passkey')
            setStep('error')
        }
    }

    const handleCancel = () => {
        logout()
        navigate('/login')
    }

    // Don't render until member is loaded from AuthContext
    if (!member) return null

    const ios = isIosDevice()

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

                {step === 'install' && (
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
                            {ios
                                ? <Share size={34} color="#008751" />
                                : <Download size={34} color="#008751" />}
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
                            Install CDSConnect First
                        </h2>
                        {ios ? (
                            <p style={{ fontSize: '0.82rem', color: '#8fa396', lineHeight: 1.6, marginBottom: '24px' }}>
                                In Safari, tap <strong>Share</strong>, select <strong>Add to Home Screen</strong>, then open <strong>CDSConnect</strong> from your Home Screen to bind your passkey.
                            </p>
                        ) : (
                            <p style={{ fontSize: '0.82rem', color: '#8fa396', lineHeight: 1.6, marginBottom: '24px' }}>
                                Install CDSConnect to your device first, then open the installed app to bind your passkey.
                            </p>
                        )}

                        {!ios && deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
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
                                Install App
                            </button>
                        )}

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

                {step === 'idle' && (
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
                            <Fingerprint size={36} color="#008751" />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
                            Bind Your Device
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#8fa396', lineHeight: 1.6, marginBottom: '24px' }}>
                            Create a passkey using your device's fingerprint, Face ID, or PIN to complete setup.
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
                            Register Passkey
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
                            Follow the prompt
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#8fa396', lineHeight: 1.6 }}>
                            Your device will ask you to authenticate with your fingerprint, Face ID, or PIN.
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
                            <Check size={40} color="#008751" strokeWidth={2.5} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12', marginBottom: '8px' }}>
                            Binding failed
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#8fa396', marginBottom: '24px', lineHeight: 1.6 }}>
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