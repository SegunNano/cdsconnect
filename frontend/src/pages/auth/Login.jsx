import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginService } from '../../services/auth.service'
import PinInput from '../../components/common/PinInput'
import { authenticateWithDevice } from '../../services/webauthn'
import { Fingerprint } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPin, setShowPin] = useState(false)   
    const [passkeyLoading, setPasskeyLoading] = useState(false)


    const handlePasskeyLogin = async () => {
        if (!email) {
            setError('Enter your email first')
            return
        }
        setPasskeyLoading(true)
        setError('')
        try {
            const result = await authenticateWithDevice(email)
            login(result.data.member, result.data.token)
            navigate('/')
        } catch (err) {
            // Passkey failed — show PIN form
            setShowPin(true)
            setError('')
        } finally {
            setPasskeyLoading(false)
        }
}

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (pin.length < 4) {
            setError('Enter your 4-digit PIN')
            return
        }
        setLoading(true)
        setError('')

        try {
            // Try WebAuthn first if browser supports it
        if (window.PublicKeyCredential) {
            try {
                const result = await authenticateWithDevice(email)
                login(result.data.member, result.data.token)
                navigate('/')
                return
            } catch (webAuthnErr) {
                // WebAuthn failed or not registered — fall through to PIN
                console.log(`WebAuthn not available, using PIN ${webAuthnErr}`)
            }
        }

        // Fall back to PIN login
            const result = await loginService(email, pin)
            login(result.data.member, result.data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '0.88rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px'
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{ width: '100%', maxWidth: '390px' }}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: '#008751',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 4px 20px rgba(0,135,81,0.3)'
                    }}>
                        <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>C</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: '#0d1b12',
                        marginBottom: '4px'
                    }}>Welcome back</h1>
                    <p style={{ fontSize: '0.82rem', color: '#8fa396' }}>
                        Sign in to CDSConnect
                    </p>
                </div>

                {/* CARD */}
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
                            marginBottom: '16px',
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                placeholder="your@email.com"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {!showPin ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePasskeyLogin}
                                    disabled={passkeyLoading}
                                    style={{
                                        width: '100%',
                                        background: passkeyLoading ? '#c2e0cf' : '#008751',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        cursor: passkeyLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        marginBottom: '12px'
                                    }}
                                >
                                    <Fingerprint size={20} color="white" />
                                    {passkeyLoading ? 'Authenticating...' : 'Sign in with Passkey'}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setShowPin(true)}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        color: '#8fa396',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                >
                                    Use PIN instead
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>PIN</label>
                                    <PinInput
                                        value={pin}
                                        onChange={(val) => { setPin(val); setError('') }}
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
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        marginBottom: '12px'
                                    }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setShowPin(false)}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        color: '#8fa396',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                >
                                    ← Back to passkey
                                </button>
                            </>
                        )}
                    </form>
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    color: '#8fa396',
                    marginTop: '24px'
                }}>
                    New member?{' '}
                    <Link to="/register" style={{
                        color: '#008751',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    )
}