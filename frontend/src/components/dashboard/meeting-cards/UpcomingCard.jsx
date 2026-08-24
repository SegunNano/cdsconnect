const UpcomingCard = ({cardStyle, day, meeting, formatTime, signInOpen, month}) => {
    return (
        <div style={cardStyle}>
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

export default UpcomingCard