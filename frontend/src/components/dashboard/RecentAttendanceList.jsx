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
                        const isPresent = record.signed_out_at || record.excuse_id || record.marked_present_by
                        const meetingDate = new Date(record.meeting_date)
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
                                    background: isPresent ? '#e6f4ee' : '#fff0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {isPresent ? '✓' : '✗'}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                        {record.title}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
                                        {meetingDate.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '3px 9px',
                                    borderRadius: '20px',
                                    background: isPresent ? '#e6f4ee' : '#fff0f0',
                                    color: isPresent ? '#008751' : '#e53e3e'
                                }}>
                                    {isPresent ? 'Present' : 'Absent'}
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