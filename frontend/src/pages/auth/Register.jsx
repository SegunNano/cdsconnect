import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerService } from '../../services/auth.service'
import { getActiveStreams } from '../../services/streams.service'
import PinInput from '../../components/common/PinInput'
import StateCodeInput from '../../components/common/StateCodeInput'
import { BREAKOUT_SESSIONS } from '../../constants'

export default function Register() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [streams, setStreams] = useState([])
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        state_code: '',
        email: '',
        gender: '',
        stream_id: '',
        breakout_session: '',
        pin: '',
        confirm_pin: ''
    })
    const [selectedStream, setSelectedStream] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const result = await getActiveStreams()
                setStreams(result.data)
            } catch (err) {
                console.error('Failed to load streams')
            }
        }
        fetchStreams()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
        setError('')

        if (name === 'stream_id') {
            const stream = streams.find(s => s.id === parseInt(value))
            setSelectedStream(stream || null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.pin !== form.confirm_pin) {
            setError('PINs do not match')
            return
        }
        if (form.pin.length < 4) {
            setError('PIN must be at least 4 digits')
            return
        }
        setLoading(true)
        setError('')

        try {
            const result = await registerService(form)
            login(result.data.member, result.data.token)
            navigate('/onboarding')
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
        height: '48px'
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
                    <p style={{ fontSize: '0.82rem', color: '#8fa396' }}>Join CDSConnect</p>
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
                            <StateCodeInput
                                value={form.state_code}
                                onChange={(val) => setForm({ ...form, state_code: val })}
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

                        {/* STREAM */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Batch & Stream</label>
                            <select
                                name="stream_id"
                                value={form.stream_id}
                                onChange={handleChange}
                                required
                                style={{ ...inputStyle, ...selectStyle, color: form.stream_id ? '#0d1b12' : '#8fa396' }}
                            >
                                <option value="">Select your batch</option>
                                {streams.map(stream => (
                                    <option key={stream.id} value={stream.id}>
                                        {stream.year} Batch {stream.batch} Stream {stream.stream}
                                    </option>
                                ))}
                            </select>

                            {/* Show callup and service end dates */}
                            {selectedStream && (
                                <div style={{
                                    background: '#e6f4ee',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    marginTop: '8px',
                                    fontSize: '0.75rem',
                                    color: '#008751'
                                }}>
                                    📅 Call up: {selectedStream.callup_date} · Service ends: {selectedStream.service_end}
                                </div>
                            )}
                        </div>

                        {/* BREAKOUT SESSION */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Breakout Session</label>
                            <select
                                name="breakout_session"
                                value={form.breakout_session}
                                onChange={handleChange}
                                required
                                style={{ ...inputStyle, ...selectStyle, color: form.breakout_session ? '#0d1b12' : '#8fa396' }}
                            >
                                <option value="">Select your session</option>
                                {BREAKOUT_SESSIONS.map(session => (
                                    <option key={session} value={session}>{session}</option>
                                ))}
                            </select>
                        </div>

                        {/* PIN */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>PIN</label>
                            <PinInput
                                value={form.pin}
                                onChange={(val) => { setForm({ ...form, pin: val }); setError('') }}
                            />
                        </div>

                        {/* CONFIRM PIN */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Confirm PIN</label>
                            <PinInput
                                value={form.confirm_pin}
                                onChange={(val) => { setForm({ ...form, confirm_pin: val }); setError('') }}
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
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

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
