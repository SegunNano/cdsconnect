
const TodayNotOpen = ({cardStyle, meeting, signInOpen, formatTime, TodaysMeeting}) => {
  return (
    <div style={cardStyle}>
                <TodaysMeeting />
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

export default TodayNotOpen