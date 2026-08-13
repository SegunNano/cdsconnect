import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerService } from '../../services/auth.service'
import { getDeviceFingerprint } from '../../utils/fingerprint'
import { BREAKOUT_SESSIONS, BATCHES, STREAMS } from '../../constants'


const Register = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        state_code: '',
        email: '',
        gender: '',
        batch_year: '',
        batch: '',
        stream: '',
        breakout_session: '',
        date_of_callup: '',
        pin: '',
        confirm_pin: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
    
        setForm({
            ...form,
            [name]: name === 'state_code'
                ? value.toUpperCase()
                : value
        })
    
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (form.pin !== form.confirm_pin) {
            setError('PINs do not match')
            setLoading(false)
            return
        }

        try {
            const device_fingerprint = await getDeviceFingerprint()
            const result = await registerService({ ...form, device_fingerprint })
            login(result.data.member, result.data.token)
            navigate('/dashboard')
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

    const selectStyle = {
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        height: '48px',
        paddingRight: '40px'
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

    const fieldStyle = { marginBottom: '16px' }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
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
                    }}>Create account</h1>
                    <p style={{
                        fontSize: '0.82rem',
                        color: '#8fa396'
                    }}>Join CDSConnect</p>
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

                        {/* FIRST + LAST NAME */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="First"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Last"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* STATE CODE */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>State Code</label>
                            <input
                                type="text"
                                name="state_code"
                                value={form.state_code}
                                onChange={handleChange}
                                placeholder="e.g. LA/24A/0142"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* EMAIL */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* GENDER */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Gender</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                required
                                style={{ ...inputStyle, ...selectStyle, color: form.gender ? '#0d1b12' : '#8fa396' }}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {/* BATCH YEAR + BATCH + STREAM */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>Year</label>
                                <input
                                    type="number"
                                    name="batch_year"
                                    value={form.batch_year}
                                    onChange={handleChange}
                                    placeholder="2025"
                                    required
                                    style={{...inputStyle, ...selectStyle}}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Batch</label>
                                <select
                                    name="batch"
                                    value={form.batch}
                                    onChange={handleChange}
                                    required
                                    style={{...inputStyle, ...selectStyle}}
                                >
                                    <option value="">--</option>
                                    {BATCHES.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Stream</label>
                                <select
                                    name="stream"
                                    value={form.stream}
                                    onChange={handleChange}
                                    required
                                    style={{...inputStyle, ...selectStyle}}
                                >
                                    <option value="">--</option>
                                    {STREAMS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* BREAKOUT SESSION */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Breakout Session</label>
                            <select
                                name="breakout_session"
                                value={form.breakout_session}
                                onChange={handleChange}
                                required
                                style={{...inputStyle, ...selectStyle}}
                            >
                                <option value="">Select your session</option>
                                {BREAKOUT_SESSIONS.map(session => (
                                    <option key={session} value={session}>{session}</option>
                                ))}
                            </select>
                        </div>

                        {/* DATE OF CALLUP */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Date of Call Up</label>
                            <input
                                type="date"
                                name="date_of_callup"
                                value={form.date_of_callup}
                                onChange={handleChange}
                                required
                                style={{...inputStyle, ...selectStyle}}
                            />
                        </div>

                        {/* PIN */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>PIN</label>
                            <input
                                type="password"
                                name="pin"
                                value={form.pin}
                                onChange={handleChange}
                                placeholder="4 to 6 digits"
                                maxLength={6}
                                required
                                style={{...inputStyle, ...selectStyle}}
                            />
                        </div>

                        {/* CONFIRM PIN */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Confirm PIN</label>
                            <input
                                type="password"
                                name="confirm_pin"
                                value={form.confirm_pin}
                                onChange={handleChange}
                                placeholder="Repeat PIN"
                                maxLength={6}
                                required
                                style={{...inputStyle, ...selectStyle}}
                            />
                        </div>

                        {/* SUBMIT */}
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
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                    </form>
                </div>

                {/* LOGIN LINK */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    color: '#8fa396',
                    marginTop: '24px',
                    paddingBottom: '40px'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{
                        color: '#008751',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Register