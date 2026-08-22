import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Calendar } from 'lucide-react'
import { getMyAttendance } from '../../services/attendance.service'

export default function AttendanceHistory() {
    const navigate = useNavigate()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await getMyAttendance()
                setRecords(result.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

const getStatus = (record) => {
     if (record.excuse_status === 'approved' || record.excuse_status === 'approved_not_needed') return 'excused'

    if (record.signed_out_at || record.marked_present_by) return 'present'

    if (record.signed_in_at && !record.signed_out_at) return 'pending'

    const meetingDate = new Date(record.meeting_date + 'T12:00:00Z')
    if (meetingDate > new Date()) return 'upcoming'
  
    return 'absent'
}

const statusConfig = {
    present: {
        label: 'Present',
        color: '#008751',
        bg: '#e6f4ee',
        icon: <CheckCircle size={14} color="#008751" />
    },
    excused: {
        label: 'Excused',
        color: '#d4900a',
        bg: '#fff8e6',
        icon: <Clock size={14} color="#d4900a" />
    },
    pending: {
        label: 'Awaiting sign-out',
        color: '#4f46e5',
        bg: '#eef2ff',
        icon: <Clock size={14} color="#4f46e5" />
    },
    absent: {
        label: 'Absent',
        color: '#e53e3e',
        bg: '#fff0f0',
        icon: <XCircle size={14} color="#e53e3e" />
    },
    upcoming: {
        label: 'Upcoming',
        color: '#8fa396',
        bg: '#f2f4f7',
        icon: <Calendar size={14} color="#8fa396" />
    }
}
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
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                        Attendance History
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        Your full record
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', marginTop: '40px' }}>
                        Loading...
                    </div>
                )}

                {!loading && records.length === 0 && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <FileText size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                            No attendance records yet
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                            Your records will appear here after meetings
                        </div>
                    </div>
                )}

                {!loading && records.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {records.map(record => {
                            const status = getStatus(record)
                            const config = statusConfig[status]
                            const meetingDate = new Date(record.meeting_date)

                            return (
                                <div
                                    key={record.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        padding: '16px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    {/* DATE BOX */}
                                    <div style={{
                                        background: '#f2f4f7',
                                        borderRadius: '10px',
                                        padding: '8px 10px',
                                        textAlign: 'center',
                                        flexShrink: 0,
                                        minWidth: '44px'
                                    }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1b12', lineHeight: 1 }}>
                                            {meetingDate.getUTCDate()}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#8fa396', textTransform: 'uppercase', marginTop: '2px' }}>
                                            {meetingDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })}
                                        </div>
                                    </div>

                                    {/* INFO */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '3px' }}>
                                            {record.title}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                            {record.is_late ? 'Late · ' : ''}
                                            {record.tokens_deducted
                                                ? `${record.tokens_deducted} token${record.tokens_deducted !== 1 ? 's' : ''} deducted`
                                                : ''}
                                            {record.marked_present_by ? ' · Manual' : ''}
                                        </div>
                                    </div>      

                                    {/* STATUS + CLEARANCE */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: config.bg,
                                            padding: '4px 8px',
                                            borderRadius: '20px'
                                        }}>
                                            {config.icon}
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: config.color }}>
                                                {config.label}
                                            </span>
                                        </div>

                                        {/* Download clearance if present */}
                                        {status === 'present' && (
                                            <div
                                                onClick={() => navigate(`/clearance/${record.meeting_id}`)}
                                                style={{
                                                    fontSize: '0.65rem',
                                                    color: '#008751',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px'
                                                }}
                                            >
                                                <FileText size={11} color="#008751" />
                                                Clearance
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}