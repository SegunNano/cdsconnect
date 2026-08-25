import { CheckCircle, Clock, XCircle, Hourglass } from 'lucide-react'

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
        icon: <Hourglass size={14} color="#8fa396" />
    }
}

export function RecentAttendanceList({ attendance, onNavigate }) {
    return (
        <>
            <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#8fa396',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '10px'
            }}>
                Recent Attendance
            </div>

            {attendance.length === 0 ? (
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
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {attendance.map(record => {
                        const statusKey = getStatus(record)
                        const config = statusConfig[statusKey]
                        const meetingDate = new Date(record.meeting_date + 'T12:00:00Z')

                        return (
                            <div key={record.meeting_id} style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                padding: '13px 16px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: config.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {config.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                        {record.title}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
                                        {meetingDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '3px 9px',
                                    borderRadius: '20px',
                                    background: config.bg,
                                    color: config.color
                                }}>
                                    {config.label}
                                </div>
                            </div>
                        )
                    })}
                    <div
                        onClick={() => onNavigate('/attendance')}
                        style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#008751',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        View full record →
                    </div>
                </div>
            )}
        </>
    )
}