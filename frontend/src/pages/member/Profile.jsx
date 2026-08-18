import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    ArrowLeft, User, Mail, Hash,
    Calendar, Layers, LogOut, Wallet
} from 'lucide-react'

const InfoRow = ({ icon, label, value }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 0',
        borderBottom: '1px solid #f2f4f7'
    }}>
        <div style={{
            width: '36px',
            height: '36px',
            background: '#e6f4ee',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{
                fontSize: '0.68rem',
                color: '#8fa396',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '2px'
            }}>
                {label}
            </div>
            <div style={{ fontSize: '0.88rem', color: '#0d1b12', fontWeight: 500 }}>
                {value || '—'}
            </div>
        </div>
    </div>
)

export default function Profile() {
    const { member, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = member?.first_name && member?.last_name
        ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
        : '??'

    const tokenBalance = member?.token_balance ?? 0

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '40px'
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
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>My Profile</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Your account details</div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* AVATAR */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#e6f4ee',
                        border: '3px solid #008751',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: '#008751'
                    }}>
                        {initials}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d1b12' }}>
                        {member?.first_name} {member?.last_name}
                    </div>
                    <div style={{
                        display: 'inline-block',
                        background: '#e6f4ee',
                        color: '#008751',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        marginTop: '6px',
                        textTransform: 'capitalize'
                    }}>
                        {member?.role?.replace('_', ' ')}
                    </div>
                </div>

                {/* INFO CARD */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '0 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    marginBottom: '14px'
                }}>
                    <InfoRow
                        icon={<Hash size={16} color="#008751" />}
                        label="State Code"
                        value={member?.state_code}
                    />
                    <InfoRow
                        icon={<Mail size={16} color="#008751" />}
                        label="Email"
                        value={member?.email}
                    />
                    <InfoRow
                        icon={<Layers size={16} color="#008751" />}
                        label="Breakout Session"
                        value={member?.breakout_session}
                    />
                    <InfoRow
                        icon={<Calendar size={16} color="#008751" />}
                        label="Batch"
                        value={member?.stream_year
                            ? `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`
                            : '—'
                        }
                    />
                    <InfoRow
                        icon={<User size={16} color="#008751" />}
                        label="Gender"
                        value={member?.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : '—'}
                    />
                    <InfoRow
                        icon={<Wallet size={16} color="#008751" />}
                        label="Token Balance"
                        value={`${tokenBalance} token${tokenBalance !== 1 ? 's' : ''} — ₦${(tokenBalance * 500).toLocaleString()}`}
                    />
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        background: '#fff0f0',
                        color: '#e53e3e',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '16px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
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