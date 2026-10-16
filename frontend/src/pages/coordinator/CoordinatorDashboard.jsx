import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Users, Calendar, FileText,
    Download, ChevronDown, LogOut,
    CheckCircle, XCircle, Clock
} from 'lucide-react'
import api from '../../services/api'

export default function CoordinatorDashboard() {
    const { member, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [overview, setOverview] = useState(null)
    const [members, setMembers] = useState([])
    const [meetings, setMeetings] = useState([])
    const [selectedMeeting, setSelectedMeeting] = useState('')
    const [attendanceReport, setAttendanceReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reportLoading, setReportLoading] = useState(false)
    const [pendingExcuses, setPendingExcuses] = useState([])
    const [reviewing, setReviewing] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, membersRes, meetingsRes, excusesRes] = await Promise.all([
                    api.get('/coordinator/overview'),
                    api.get('/coordinator/members'),
                    api.get('/meetings'),
                    api.get('/excuses/pending')
                ])
                setOverview(overviewRes.data.data)
                setMembers(membersRes.data.data)
                setMeetings(meetingsRes.data.data)
                setPendingExcuses(excusesRes.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleMeetingSelect = async (meetingId) => {
        setSelectedMeeting(meetingId)
        if (!meetingId) return
        setReportLoading(true)
        try {
            const res = await api.get(`/coordinator/attendance/${meetingId}`)
            setAttendanceReport(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setReportLoading(false)
        }
    }

    const downloadMembersPdf = () => {
        window.open(`${import.meta.env.VITE_API_URL}/coordinator/members/pdf`, '_blank')
    }

    const downloadAttendancePdf = () => {
        if (!selectedMeeting) return
        window.open(`${import.meta.env.VITE_API_URL}/coordinator/attendance/${selectedMeeting}/pdf`, '_blank')
    }

    const handleReview = async (excuseId, decision) => {
        setReviewing(excuseId)
        try {
            await api.post('/excuses/review', { excuseId, decision })
            setPendingExcuses(prev => prev.filter(e => e.id !== excuseId))
        } catch (err) {
            console.error(err)
        } finally {
            setReviewing(null)
        }
    }

    // Group members by stream
    const streamGroups = {}
    members.forEach(m => {
        const key = `${m.stream_year} Batch ${m.stream_batch} Stream ${m.stream_number}`
        if (!streamGroups[key]) streamGroups[key] = []
        streamGroups[key].push(m)
    })

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Users },
        { key: 'members', label: 'Members', icon: Users },
        { key: 'attendance', label: 'Attendance', icon: Calendar },
        { key: 'excuses', label: 'Excuses', icon: Clock }
    ]

    const s = {
        card: {
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            marginBottom: '10px'
        },
        sectionHead: {
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#8fa396',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '10px'
        }
    }

    if (loading) return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#8fa396'
        }}>
            Loading...
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '90px'
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
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#8fa396', marginBottom: '2px' }}>
                        Coordinator Portal
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d1b12' }}>
                        Hello, <span style={{ color: '#008751' }}>{member?.first_name}</span>
                    </div>
                </div>
                <button
                    onClick={() => { logout(); navigate('/login') }}
                    style={{
                        background: '#fff0f0', border: 'none',
                        borderRadius: '10px', padding: '8px 12px',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '6px',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: '#e53e3e',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    <LogOut size={14} color="#e53e3e" />
                    Sign Out
                </button>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && overview && (
                    <>
                        {/* STATS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                            <div style={s.card}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Active Members
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#008751' }}>
                                    {overview.total_members}
                                </div>
                            </div>
                            <div style={s.card}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Meetings Held
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5' }}>
                                    {overview.total_meetings}
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE STREAMS */}
                        <div style={s.sectionHead}>Active Streams</div>
                        {overview.active_streams.map(stream => (
                            <div key={stream.id} style={{
                                ...s.card,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '44px', height: '44px',
                                    background: '#e6f4ee', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Users size={20} color="#008751" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '2px' }}>
                                        {stream.year} Batch {stream.batch} Stream {stream.stream}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                        {stream.member_count} members · Ends {new Date(stream.service_end + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{
                                    background: '#e6f4ee',
                                    color: '#008751',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '4px 10px',
                                    borderRadius: '20px'
                                }}>
                                    Active
                                </div>
                            </div>
                        ))}

                        {/* PENDING EXCUSES SHORTCUT */}
                        {pendingExcuses.length > 0 && (
                            <div
                                onClick={() => setActiveTab('excuses')}
                                style={{
                                    ...s.card,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid #fff8e6'
                                }}
                            >
                                <div style={{
                                    width: '44px', height: '44px',
                                    background: '#fff8e6', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Clock size={20} color="#d4900a" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                        Pending Excuses
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                        {pendingExcuses.length} awaiting review
                                    </div>
                                </div>
                                <div style={{
                                    background: '#fff8e6', color: '#d4900a',
                                    fontSize: '0.72rem', fontWeight: 700,
                                    padding: '4px 10px', borderRadius: '20px'
                                }}>
                                    {pendingExcuses.length}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={s.sectionHead}>
                                All Members ({members.length})
                            </div>
                            <button
                                onClick={downloadMembersPdf}
                                style={{
                                    background: '#008751', border: 'none',
                                    borderRadius: '10px', padding: '8px 12px',
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '6px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    color: 'white',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                <Download size={13} color="white" />
                                Download PDF
                            </button>
                        </div>

                        {Object.entries(streamGroups).map(([streamName, streamMembers]) => (
                            <div key={streamName} style={{ marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '0.78rem', fontWeight: 700,
                                    color: '#008751', marginBottom: '8px',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>{streamName}</span>
                                    <span style={{
                                        background: '#e6f4ee', color: '#008751',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        padding: '2px 8px', borderRadius: '20px'
                                    }}>
                                        {streamMembers.length}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {streamMembers.map((m, i) => (
                                        <div key={m.id} style={{
                                            background: '#ffffff',
                                            borderRadius: '10px',
                                            padding: '12px 14px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <div style={{
                                                width: '28px', height: '28px',
                                                background: '#f2f4f7', borderRadius: '8px',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 700,
                                                color: '#8fa396', flexShrink: 0
                                            }}>
                                                {i + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12' }}>
                                                    {m.first_name} {m.last_name}
                                                    {m.role !== 'member' && (
                                                        <span style={{
                                                            background: '#eef2ff', color: '#4f46e5',
                                                            fontSize: '0.6rem', fontWeight: 700,
                                                            padding: '2px 5px', borderRadius: '4px',
                                                            marginLeft: '6px'
                                                        }}>
                                                            {m.role.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
                                                    {m.state_code}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
                    <>
                        <div style={s.sectionHead}>Meeting Attendance</div>

                        {/* MEETING SELECTOR */}
                        <div style={{ ...s.card, marginBottom: '14px' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                Select Meeting
                            </div>
                            <select
                                value={selectedMeeting}
                                onChange={e => handleMeetingSelect(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: '#f2f4f7',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    fontSize: '0.85rem',
                                    color: selectedMeeting ? '#0d1b12' : '#8fa396',
                                    outline: 'none',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    appearance: 'none'
                                }}
                            >
                                <option value="">Choose a meeting...</option>
                                {meetings
                                    .filter(m => new Date(m.sign_in_close) < new Date())
                                    .map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.title} — {m.meeting_date}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {reportLoading && (
                            <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '20px 0' }}>
                                Loading report...
                            </div>
                        )}

                        {attendanceReport && !reportLoading && (
                            <>
                                {/* SUMMARY */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                                    {[
                                        { label: 'Present', value: attendanceReport.totals.present, color: '#008751', bg: '#e6f4ee' },
                                        { label: 'Absent', value: attendanceReport.totals.absent, color: '#e53e3e', bg: '#fff0f0' },
                                        { label: 'Total', value: attendanceReport.totals.total, color: '#0d1b12', bg: '#f2f4f7' }
                                    ].map(stat => (
                                        <div key={stat.label} style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                                                {stat.value}
                                            </div>
                                            <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase' }}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DOWNLOAD */}
                                <button
                                    onClick={downloadAttendancePdf}
                                    style={{
                                        width: '100%',
                                        background: '#008751', border: 'none',
                                        borderRadius: '12px', padding: '13px',
                                        cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        gap: '8px', fontSize: '0.85rem',
                                        fontWeight: 700, color: 'white',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        marginBottom: '14px'
                                    }}
                                >
                                    <Download size={16} color="white" />
                                    Download Attendance PDF
                                </button>

                                {/* PRESENT LIST */}
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008751', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                                    Present ({attendanceReport.totals.present})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                    {attendanceReport.present.map((m, i) => (
                                        <div key={m.id} style={{
                                            background: '#ffffff', borderRadius: '10px',
                                            padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            display: 'flex', alignItems: 'center', gap: '10px'
                                        }}>
                                            <CheckCircle size={16} color="#008751" />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12' }}>
                                                    {m.first_name} {m.last_name}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
                                                    {m.state_code}
                                                    {m.is_late ? ' · Late' : ''}
                                                    {m.marked_present_by ? ' · Manual' : ''}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                                #{m.sequence_number || '—'}
                                            </div>
                                        </div>
                                    ))}
                                    {attendanceReport.present.length === 0 && (
                                        <div style={{ color: '#8fa396', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>
                                            No one present
                                        </div>
                                    )}
                                </div>

                                {/* ABSENT LIST */}
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                                    Absent ({attendanceReport.totals.absent})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {attendanceReport.absent.map((m, i) => (
                                        <div key={m.id} style={{
                                            background: '#ffffff', borderRadius: '10px',
                                            padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            display: 'flex', alignItems: 'center', gap: '10px'
                                        }}>
                                            <XCircle size={16} color="#e53e3e" />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12' }}>
                                                    {m.first_name} {m.last_name}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
                                                    {m.state_code}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {attendanceReport.absent.length === 0 && (
                                        <div style={{ color: '#8fa396', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>
                                            No absentees
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* EXCUSES TAB */}
                {activeTab === 'excuses' && (
                    <>
                        <div style={s.sectionHead}>
                            Pending Excuses ({pendingExcuses.length})
                        </div>

                        {pendingExcuses.length === 0 && (
                            <div style={{
                                ...s.card, textAlign: 'center',
                                padding: '40px 20px'
                            }}>
                                <CheckCircle size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                                    All caught up
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                                    No pending excuse requests
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pendingExcuses.map(excuse => (
                                <div key={excuse.id} style={s.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                                {excuse.first_name} {excuse.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                                {excuse.state_code} · {excuse.meeting_title}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#fff8e6', color: '#d4900a',
                                            fontSize: '0.65rem', fontWeight: 600,
                                            padding: '3px 8px', borderRadius: '20px',
                                            height: 'fit-content'
                                        }}>
                                            Pending
                                        </div>
                                    </div>

                                    <div style={{
                                        background: '#f2f4f7', borderRadius: '10px',
                                        padding: '10px 12px', fontSize: '0.8rem',
                                        color: '#4a5e52', marginBottom: '10px',
                                        lineHeight: 1.5
                                    }}>
                                        {excuse.reason}
                                    </div>

                                    {excuse.evidence_url && (
                                        <a
                                            href={excuse.evidence_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center',
                                                gap: '4px', fontSize: '0.72rem',
                                                color: '#008751', fontWeight: 600,
                                                textDecoration: 'none', marginBottom: '10px'
                                            }}
                                        >
                                            <FileText size={12} color="#008751" />
                                            View Evidence
                                        </a>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button
                                            onClick={() => handleReview(excuse.id, 'approved')}
                                            disabled={reviewing === excuse.id}
                                            style={{
                                                background: '#e6f4ee', border: 'none',
                                                borderRadius: '10px', padding: '10px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                gap: '6px', fontSize: '0.78rem',
                                                fontWeight: 600, color: '#008751',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <CheckCircle size={14} color="#008751" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(excuse.id, 'rejected')}
                                            disabled={reviewing === excuse.id}
                                            style={{
                                                background: '#fff0f0', border: 'none',
                                                borderRadius: '10px', padding: '10px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                gap: '6px', fontSize: '0.78rem',
                                                fontWeight: 600, color: '#e53e3e',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <XCircle size={14} color="#e53e3e" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed', bottom: 0,
                left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: '390px',
                background: '#ffffff', borderTop: '1px solid #e8ece9',
                display: 'flex', padding: '10px 0 24px',
                zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <div
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                gap: '4px', cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#e6f4ee' : 'transparent',
                                borderRadius: '8px', position: 'relative'
                            }}>
                                <Icon size={18} color={isActive ? '#008751' : '#8fa396'} />
                                {tab.key === 'excuses' && pendingExcuses.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '2px', right: '2px',
                                        width: '8px', height: '8px',
                                        background: '#e53e3e', borderRadius: '50%'
                                    }} />
                                )}
                            </div>
                            <div style={{
                                fontSize: '0.58rem', fontWeight: 600,
                                color: isActive ? '#008751' : '#8fa396',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {tab.label}
                            </div>
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}