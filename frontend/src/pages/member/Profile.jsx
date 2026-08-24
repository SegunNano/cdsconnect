import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    ArrowLeft, User, Mail, Hash,
    Calendar, Layers, LogOut,
    Wallet, Edit2, Check, X,
    KeyRound, ChevronRight, Fingerprint, UserLock
} from 'lucide-react'
import { updateMyProfile } from '../../services/members.service'
import { resetPin } from '../../services/pin.sevice'
import { BREAKOUT_SESSIONS } from '../../constants'
import PinInput from '../../components/common/PinInput'

export default function Profile() {
    const { member, logout, setMember } = useAuth()
    const navigate = useNavigate()

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    // PIN reset state
    const [showPinForm, setShowPinForm] = useState(false)
    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [pinLoading, setPinLoading] = useState(false)
    const [pinError, setPinError] = useState('')
    const [pinSuccess, setPinSuccess] = useState(false)



    const startEditing = () => {
        setForm({
            first_name: member.first_name,
            last_name: member.last_name,
            state_code: member.state_code,
            gender: member.gender,
            stream_id: member.stream_id,
            breakout_session: member.breakout_session
        })
        setSaveError('')
        setEditing(true)
    }

    const cancelEditing = () => {
        setEditing(false)
        setSaveError('')
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveError('')
        try {
            const result = await updateMyProfile(form)
            // Update stored member
            const updated = result.data
            localStorage.setItem('member', JSON.stringify(updated))
            setMember(updated)
            setEditing(false)
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handlePinReset = async (e) => {
        e.preventDefault()
        if (newPin.length < 4) { setPinError('PIN must be at least 4 digits'); return }
        if (newPin !== confirmPin) { setPinError('PINs do not match'); return }
        setPinLoading(true)
        setPinError('')
        try {
            await resetPin(newPin, confirmPin)
            setPinSuccess(true)
            setNewPin('')
            setConfirmPin('')
            setTimeout(() => { setPinSuccess(false); setShowPinForm(false) }, 2000)
        } catch (err) {
            setPinError(err.response?.data?.message || 'Failed to update PIN')
        } finally {
            setPinLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = member
        ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
        : '??'

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 12px',
        fontSize: '0.85rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
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
                justifyContent: 'space-between',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        onClick={() => navigate('/')}
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
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>My Profile</div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Account details</div>
                    </div>
                </div>

                {!editing ? (
                    <button
                        onClick={startEditing}
                        style={{
                            background: '#e6f4ee',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#008751',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        <Edit2 size={14} color="#008751" />
                        Edit
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={cancelEditing}
                            style={{
                                background: '#f2f4f7', border: 'none',
                                borderRadius: '10px', padding: '8px 12px',
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: '4px',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: '#4a5e52',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            <X size={14} color="#4a5e52" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                background: saving ? '#c2e0cf' : '#008751',
                                border: 'none', borderRadius: '10px',
                                padding: '8px 12px', cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center',
                                gap: '4px', fontSize: '0.75rem',
                                fontWeight: 600, color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            <Check size={14} color="white" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: '20px' }}>

                {/* AVATAR */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        borderRadius: '50%',
                        background: '#e6f4ee',
                        border: '3px solid #008751',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        fontSize: '1.4rem', fontWeight: 800,
                        color: '#008751'
                    }}>
                        {initials}
                    </div>
                    {!editing ? (
                        <>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d1b12' }}>
                                {member?.first_name} {member?.last_name}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: '#e6f4ee', color: '#008751',
                                fontSize: '0.72rem', fontWeight: 600,
                                padding: '4px 12px', borderRadius: '20px',
                                marginTop: '6px', textTransform: 'capitalize'
                            }}>
                                {member?.role?.replace('_', ' ')}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <input
                                value={form.first_name || ''}
                                onChange={e => setForm({ ...form, first_name: e.target.value })}
                                placeholder="First name"
                                style={inputStyle}
                            />
                            <input
                                value={form.last_name || ''}
                                onChange={e => setForm({ ...form, last_name: e.target.value })}
                                placeholder="Last name"
                                style={inputStyle}
                            />
                        </div>
                    )}
                </div>

                {saveError && (
                    <div style={{
                        background: '#fff0f0', color: '#e53e3e',
                        fontSize: '0.8rem', padding: '10px 14px',
                        borderRadius: '10px', marginBottom: '12px'
                    }}>
                        {saveError}
                    </div>
                )}

                {/* INFO CARD */}
                <div style={{
                    background: '#ffffff', borderRadius: '18px',
                    padding: '0 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    marginBottom: '14px'
                }}>

                    {/* STATE CODE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f2f4f7' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e6f4ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Hash size={16} color="#008751" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>State Code</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>{member?.state_code}</div>
                        </div>
                        {editing && (
                            <></>
                        )}
                    </div>

                    {/* EMAIL — not editable */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f2f4f7' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e6f4ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Mail size={16} color="#008751" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Email</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>{member?.email}</div>
                        </div>
                    </div>

                    {/* GENDER */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f2f4f7' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e6f4ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={16} color="#008751" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Gender</div>
                            {editing ? (
                                <select
                                    value={form.gender || ''}
                                    onChange={e => setForm({ ...form, gender: e.target.value })}
                                    style={{ ...inputStyle, appearance: 'none' }}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500, textTransform: 'capitalize' }}>{member?.gender}</div>
                            )}
                        </div>
                    </div>

                    {/* BATCH / STREAM */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f2f4f7' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e6f4ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Calendar size={16} color="#008751" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Batch</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>
                                {member?.stream_year
                                    ? `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`
                                    : '—'}
                            </div>
                        </div>
                        {editing && (
                            <></>
                        )}
                    </div>

                    {/* BREAKOUT SESSION */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f2f4f7' }}>
                        <div style={{ width: '36px', height: '36px', background: '#e6f4ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Layers size={16} color="#008751" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Breakout Session</div>
                            {editing ? (
                                <select
                                    value={form.breakout_session || ''}
                                    onChange={e => setForm({ ...form, breakout_session: e.target.value })}
                                    style={{ ...inputStyle, appearance: 'none' }}
                                >
                                    {BREAKOUT_SESSIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            ) : (
                                <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>{member?.breakout_session}</div>
                            )}
                        </div>
                    </div>

                    {/* TOKEN BALANCE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
                        <div style={{ width: '36px', height: '36px', background: '#fff8e6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Wallet size={16} color="#d4900a" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Token Balance</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>
                                {member?.token_balance} token{member?.token_balance !== 1 ? 's' : ''} — ₦{(member?.token_balance * 500).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECURITY SECTION */}
                <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                    marginBottom: '10px'
                }}>
                    Security
                </div>

                <div style={{
                    background: '#ffffff', borderRadius: '18px',
                    padding: '0 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    marginBottom: '14px'
                }}>
                    {/* RESET PIN */}
                    <div
                        onClick={() => { setShowPinForm(!showPinForm); setPinError(''); setPinSuccess(false) }}
                        style={{
                            display: 'flex', alignItems: 'center',
                            gap: '12px', padding: '14px 0',
                            borderBottom: showPinForm ? '1px solid #f2f4f7' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '36px', height: '36px', background: '#fff8e6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <KeyRound size={16} color="#d4900a" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>PIN</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>Change PIN</div>
                        </div>
                        <ChevronRight size={16} color="#8fa396" style={{ transform: showPinForm ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </div>

                    {showPinForm && (
                        <div style={{ padding: '16px 0' }}>
                            {pinSuccess ? (
                                <div style={{
                                    background: '#e6f4ee', borderRadius: '10px',
                                    padding: '12px', textAlign: 'center',
                                    fontSize: '0.82rem', fontWeight: 600, color: '#008751'
                                }}>
                                    ✅ PIN updated successfully
                                </div>
                            ) : (
                                <form onSubmit={handlePinReset}>
                                    {pinError && (
                                        <div style={{
                                            background: '#fff0f0', color: '#e53e3e',
                                            fontSize: '0.78rem', padding: '10px 12px',
                                            borderRadius: '10px', marginBottom: '14px',
                                            textAlign: 'center'
                                        }}>
                                            {pinError}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', textAlign: 'center' }}>
                                            New PIN
                                        </div>
                                        <PinInput
                                            value={newPin}
                                            onChange={val => { setNewPin(val); setPinError('') }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', textAlign: 'center' }}>
                                            Confirm PIN
                                        </div>
                                        <PinInput
                                            value={confirmPin}
                                            onChange={val => { setConfirmPin(val); setPinError('') }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={pinLoading}
                                        style={{
                                            width: '100%',
                                            background: pinLoading ? '#c2e0cf' : '#008751',
                                            border: 'none', borderRadius: '12px',
                                            padding: '13px', cursor: pinLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '0.88rem', fontWeight: 700,
                                            color: 'white',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                                        }}
                                    >
                                        {pinLoading ? 'Updating...' : 'Update PIN'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* PASSKEY */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '12px', padding: '14px 0',
                        cursor: 'pointer'
                    }}>
                        <div style={{ width: '36px', height: '36px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Fingerprint size={16} color="#4f46e5" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.68rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Passkey</div>
                            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>
                                {member?.credential_id ? 'Device bound ✅' : 'Not set up'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        background: '#fff0f0', color: '#e53e3e',
                        border: 'none', borderRadius: '14px',
                        padding: '16px', fontSize: '0.9rem',
                        fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    <LogOut size={18} color="#e53e3e" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}