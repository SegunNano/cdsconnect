import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyProfile } from '../../services/members.service'
import { getActiveMeeting } from '../../services/meetings.service'

const s = {
    page: {
        minHeight: '100vh',
        background: '#f2f4f7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: '390px',
        margin: '0 auto',
        position: 'relative',
        paddingBottom: '90px'
    },
    // TOP BAR
    topbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '52px 20px 16px',
        background: '#ffffff'
    },
    greetingLine: {
        fontSize: '0.78rem',
        color: '#8fa396',
        fontWeight: 400,
        marginBottom: '2px'
    },
    greetingName: {
        fontSize: '1.2rem',
        fontWeight: 700,
        color: '#0d1b12'
    },
    topbarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    notifWrap: {
        position: 'relative',
        width: '40px',
        height: '40px',
        background: '#f2f4f7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    notifPip: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '8px',
        height: '8px',
        background: '#e53e3e',
        borderRadius: '50%',
        border: '2px solid white'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#e6f4ee',
        border: '2px solid #c2e0cf',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.78rem',
        color: '#008751'
    },
    // CHIPS
    chipRow: {
        background: '#ffffff',
        padding: '0 20px 16px',
        display: 'flex',
        gap: '6px'
    },
    chip: (color = '#008751', bg = '#e6f4ee') => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: bg,
        color: color,
        fontSize: '0.72rem',
        fontWeight: 600,
        padding: '5px 10px',
        borderRadius: '20px'
    }),
    chipDot: (color = '#008751') => ({
        width: '6px',
        height: '6px',
        background: color,
        borderRadius: '50%'
    }),
    // CONTENT
    content: { padding: '16px 20px 0' },
    sectionHead: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#8fa396',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '10px'
    },
    card: {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '14px'
    },
    cardSm: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    },
    // BOTTOM NAV
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '390px',
        background: '#ffffff',
        borderTop: '1px solid #e8ece9',
        display: 'flex',
        padding: '10px 0 24px',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
    },
    navTab: (active) => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
    }),
    navIcon: (active) => ({
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        background: active ? '#e6f4ee' : 'transparent',
        borderRadius: active ? '8px' : '0'
    }),
    navLabel: (active) => ({
        fontSize: '0.58rem',
        fontWeight: 600,
        color: active ? '#008751' : '#8fa396',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    })
}

// Meeting card states
const MeetingCard = ({ meeting, member }) => {
    if (!meeting) {
        return (
            <div style={{ ...s.card, textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                    No upcoming meeting
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                    Check back later
                </div>
            </div>
        )
    }

    const meetingDate = new Date(meeting.meeting_date)
    const day = meetingDate.getDate()
    const month = meetingDate.toLocaleString('default', { month: 'short' })
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)
    const lateThreshold = new Date(meeting.late_threshold)

    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    // Upcoming meeting card
    if (meeting.state === 'upcoming') {
        return (
            <div style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        background: '#008751',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        textAlign: 'center',
                        flexShrink: 0
                    }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{month}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#008751', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
                            Upcoming Meeting
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '3px' }}>
                            {meeting.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            Opens at {formatTime(signInOpen)}
                        </div>
                    </div>
                    <div style={{
                        background: '#e6f4ee',
                        color: '#008751',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        flexShrink: 0
                    }}>
                        {meeting.meeting_cost} token
                    </div>
                </div>
            </div>
        )
    }

    // Today not open yet
    if (meeting.state === 'today_not_open') {
        return (
            <div style={s.card}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{
                    background: '#f2f4f7',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500 }}>
                        Sign-in opens at <strong style={{ color: '#008751' }}>{formatTime(signInOpen)}</strong>
                    </div>
                </div>
            </div>
        )
    }

    // Sign-in open — on time or late
    if (meeting.state === 'open_on_time' || meeting.state === 'open_late') {
        const isLate = meeting.state === 'open_late'
        const totalCost = isLate
            ? meeting.meeting_cost + meeting.lateness_cost
            : meeting.meeting_cost

        return (
            <div style={s.card}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                            Today's Meeting
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                            {meeting.title}
                        </div>
                    </div>
                    <div style={{
                        background: isLate ? '#fff8e6' : '#e6f4ee',
                        color: isLate ? '#d4900a' : '#008751',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap'
                    }}>
                        {isLate ? '⚠️ Late' : '✅ On time'}
                    </div>
                </div>

                {/* RIPPLE BUTTON */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Ripple rings */}
                        <div style={{
                            position: 'absolute',
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            border: '1.5px solid rgba(0,135,81,0.2)',
                            animation: 'ripple 2s ease-out infinite'
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '165px',
                            height: '165px',
                            borderRadius: '50%',
                            border: '1.5px solid rgba(0,135,81,0.12)',
                            animation: 'ripple 2s ease-out infinite',
                            animationDelay: '0.5s'
                        }} />
                        <button
                            style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                background: '#008751',
                                border: 'none',
                                cursor: member.token_balance < totalCost ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '4px',
                                boxShadow: '0 4px 20px rgba(0,135,81,0.35)',
                                opacity: member.token_balance < totalCost ? 0.5 : 1,
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <span style={{ fontSize: '1.6rem' }}>📍</span>
                            <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.9)',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                {member.token_balance < totalCost ? 'No tokens' : 'Tap to sign in'}
                            </span>
                        </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500, marginBottom: '3px' }}>
                            Closes at {formatTime(signInClose)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                            {isLate
                                ? <span>Late fee applies · <strong style={{ color: '#d4900a' }}>{totalCost} tokens</strong></span>
                                : <span>Late after {formatTime(lateThreshold)} · <strong style={{ color: '#d4900a' }}>+{meeting.lateness_cost} token</strong></span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Sign-in closed
    if (meeting.state === 'sign_in_closed') {
        return (
            <div style={s.card}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{
                    background: '#fff0f0',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 500 }}>
                        Sign-in is closed
                    </div>
                </div>
            </div>
        )
    }

    return null
}
const Dashboard = () => {
    const { member: authMember, logout } = useAuth()
    const navigate = useNavigate()

    const [member, setMember] = useState(null)
    const [meeting, setMeeting] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('home')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, meetingRes] = await Promise.all([
                    getMyProfile(),
                    getActiveMeeting()
                ])
                setMember(memberRes.data)
                setMeeting(meetingRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#8fa396',
                fontSize: '0.88rem'
            }}>
                Loading...
            </div>
        )
    }

    if (!member) return null

    const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // Tabs based on role
    const tabs = [
        { key: 'home', label: 'Home', icon: '🏠' },
        { key: 'meetings', label: 'Meetings', icon: '📅' },
        { key: 'clearance', label: 'Clearance', icon: '📄' },
        { key: 'profile', label: 'Profile', icon: '👤' },
        ...(member.role === 'treasurer' || member.role === 'financial_secretary'
            ? [{ key: 'topup', label: 'Top Up', icon: '🪙' }]
            : []),
        ...(member.role === 'coordinator'
            ? [{ key: 'coordinator', label: 'Manage', icon: '⚙️' }]
            : []),
        ...(member.role === 'president' || member.role === 'vice_president'
            ? [{ key: 'signout', label: 'Sign Out', icon: '✅' }]
            : []),
        ...(member.is_dev
            ? [{ key: 'dev', label: 'Dev', icon: '🛠️' }]
            : [])
    ]

    return (
        <>
            <style>{`
                @keyframes ripple {
                    0% { opacity: 1; transform: scale(0.95); }
                    100% { opacity: 0; transform: scale(1.08); }
                }
            `}</style>

            <div style={s.page}>

                {/* TOP BAR */}
                <div style={s.topbar}>
                    <div>
                        <div style={s.greetingLine}>{today}</div>
                        <div style={s.greetingName}>
                            Hey, <span style={{ color: '#008751' }}>{member.first_name}</span> 👋
                        </div>
                    </div>
                    <div style={s.topbarRight}>
                        <div style={s.notifWrap}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5e52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <div style={s.notifPip} />
                        </div>
                        <div style={s.avatar}>{initials}</div>
                    </div>
                </div>

                {/* CHIPS */}
                <div style={s.chipRow}>
                    <div style={s.chip()}>
                        <div style={s.chipDot()} />
                        {member.state_code}
                    </div>
                    <div style={s.chip('#d4900a', '#fff8e6')}>
                        <div style={s.chipDot('#d4900a')} />
                        {member.token_balance} Token{member.token_balance !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* CONTENT */}
                <div style={s.content}>

                    {/* MEETING CARD */}
                    <MeetingCard meeting={meeting} member={member} />

                    {/* STATS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div style={s.cardSm}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Token Balance
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#008751', lineHeight: 1, marginBottom: '4px' }}>
                                {member.token_balance}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                ≈ ₦{(member.token_balance * 500).toLocaleString()} value
                            </div>
                        </div>
                        <div style={s.cardSm}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                This Month
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d1b12', lineHeight: 1, marginBottom: '4px' }}>
                                —
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                No record yet
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div style={s.sectionHead}>Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {[
                            { icon: '📄', label: 'Clearance Slip', bg: '#e6f4ee', path: '/clearance' },
                            { icon: '🙋', label: 'File Excuse', bg: '#fff0f0', path: '/excuse' },
                            { icon: '🔑', label: 'Reset PIN', bg: '#fff8e6', path: '/reset-pin' },
                            { icon: '📊', label: 'My Record', bg: '#eef2ff', path: '/attendance' }
                        ].map((action) => (
                            <div
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    padding: '12px 6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: action.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem'
                                }}>
                                    {action.icon}
                                </div>
                                <div style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    color: '#4a5e52',
                                    textAlign: 'center',
                                    lineHeight: 1.3
                                }}>
                                    {action.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RECENT ATTENDANCE */}
                    <div style={s.sectionHead}>Recent Attendance</div>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center',
                        color: '#8fa396',
                        fontSize: '0.82rem'
                    }}>
                        No attendance records yet
                    </div>

                </div>
            </div>

            {/* BOTTOM NAV */}
            <nav style={s.bottomNav}>
                {tabs.map(tab => (
                    <div
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={s.navTab(activeTab === tab.key)}
                    >
                        <div style={s.navIcon(activeTab === tab.key)}>
                            {tab.icon}
                        </div>
                        <div style={s.navLabel(activeTab === tab.key)}>
                            {tab.label}
                        </div>
                    </div>
                ))}
            </nav>
        </>
    )
}

export default Dashboard




