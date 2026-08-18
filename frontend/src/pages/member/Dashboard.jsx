import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyProfile } from '../../services/members.service'
import { getActiveMeeting } from '../../services/meetings.service'
import {
    Bell, FileText, FilePlus,
    KeyRound, ClipboardList, Wallet,
    Home, Calendar, FileCheck, User,
    Coins, LayoutDashboard, LogOut,
    Settings2, MapPin, CalendarOff
} from 'lucide-react'

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
}

const MeetingCard = ({ meeting, member }) => {
    if (!meeting) {
        return (
            <div style={{ ...s.card, textAlign: 'center', padding: '30px 20px' }}>
                <CalendarOff size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
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
    const day = meetingDate.getUTCDate()
    const month = meetingDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)
    const lateThreshold = new Date(meeting.late_threshold)

    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

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

    if (meeting.state === 'today_not_open') {
        return (
            <div style={s.card}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{ background: '#f2f4f7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500 }}>
                        Sign-in opens at <strong style={{ color: '#008751' }}>{formatTime(signInOpen)}</strong>
                    </div>
                </div>
            </div>
        )
    }

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
                        {isLate ? 'Late' : 'On time'}
                    </div>
                </div>

                {/* RIPPLE BUTTON */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            disabled={member.token_balance < totalCost}
                            style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                background: member.token_balance < totalCost ? '#c2e0cf' : '#008751',
                                border: 'none',
                                cursor: member.token_balance < totalCost ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px',
                                boxShadow: member.token_balance < totalCost
                                    ? 'none'
                                    : '0 4px 20px rgba(0,135,81,0.35)',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <MapPin size={28} color="white" />
                            <span style={{
                                fontSize: '0.58rem',
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

    if (meeting.state === 'sign_in_closed') {
        return (
            <div style={s.card}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Today's Meeting
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
                    {meeting.title}
                </div>
                <div style={{ background: '#fff0f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 500 }}>
                        Sign-in is closed
                    </div>
                </div>
            </div>
        )
    }

    return null
}

export default function Dashboard() {
    const { member: authMember, logout } = useAuth()
    const navigate = useNavigate()

    const [member, setMember] = useState(null)
    const [meeting, setMeeting] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
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

    const quickActions = [
        { icon: <FileCheck size={18} color="#008751" />, label: 'Clearance Slip', bg: '#e6f4ee', path: '/clearance' },
        { icon: <FilePlus size={18} color="#e53e3e" />, label: 'File Excuse', bg: '#fff0f0', path: '/excuse' },
        { icon: <KeyRound size={18} color="#d4900a" />, label: 'Reset PIN', bg: '#fff8e6', path: '/reset-pin' },
        { icon: <ClipboardList size={18} color="#4f46e5" />, label: 'My Record', bg: '#eef2ff', path: '/attendance' }
    ]

    const tabs = [
        { key: 'home', label: 'Home', icon: Home },
        { key: 'meetings', label: 'Meetings', icon: Calendar },
        { key: 'clearance', label: 'Clearance', icon: FileText },
        { key: 'profile', label: 'Profile', icon: User },
        ...(member.role === 'treasurer' || member.role === 'financial_secretary'
            ? [{ key: 'topup', label: 'Top Up', icon: Coins }]
            : []),
        ...(member.role === 'president' || member.role === 'vice_president'
            ? [{ key: 'signout', label: 'Sign Out', icon: LogOut }]
            : []),
        ...(member.is_dev
            ? [{ key: 'dev', label: 'Dev', icon: Settings2 }]
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
                        <div style={s.notifWrap} onClick={() => navigate('/notifications')}>
                            <Bell size={20} color="#4a5e52" />
                            {unreadCount > 0 && <div style={s.notifPip} />}
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
                        <Wallet size={10} color="#d4900a" />
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
                        {quickActions.map((action) => (
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
                                    justifyContent: 'center'
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
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <div
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#e6f4ee' : 'transparent',
                                borderRadius: '8px'
                            }}>
                                <Icon
                                    size={18}
                                    color={isActive ? '#008751' : '#8fa396'}
                                />
                            </div>
                            <div style={{
                                fontSize: '0.58rem',
                                fontWeight: 600,
                                color: isActive ? '#008751' : '#8fa396',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {tab.label}
                            </div>
                        </div>
                    )
                })}
            </nav>
        </>
    )
}