import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginService } from '../../services/auth.service'
import { getDeviceFingerprint } from '../../utils/fingerprint'


const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', pin: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const deviceFingerprint = await getDeviceFingerprint()
            const result = await loginService(form.email, form.pin, deviceFingerprint)
            login(result.data.member, result.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
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
                    <p style={{
                        fontSize: '0.82rem',
                        color: '#8fa396',
                        fontWeight: 400
                    }}>Sign in to CDSConnect</p>
                </div>

                {/* CARD */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                }}>

                    {/* ERROR */}
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

                        {/* EMAIL */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#4a5e52',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                marginBottom: '8px'
                            }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                                style={{
                                    width: '100%',
                                    background: '#f2f4f7',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    fontSize: '0.88rem',
                                    color: '#0d1b12',
                                    outline: 'none',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            />
                        </div>

                        {/* PIN */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#4a5e52',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                marginBottom: '8px'
                            }}>PIN</label>
                            <input
                                type="password"
                                name="pin"
                                value={form.pin}
                                onChange={handleChange}
                                placeholder="Enter your PIN"
                                maxLength={6}
                                required
                                style={{
                                    width: '100%',
                                    background: '#f2f4f7',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    fontSize: '0.88rem',
                                    color: '#0d1b12',
                                    outline: 'none',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            />
                        </div>

                        {/* BUTTON */}
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
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                    </form>
                </div>

                {/* REGISTER LINK */}
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

export default Login


