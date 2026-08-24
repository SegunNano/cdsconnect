import { CalendarOff } from "lucide-react"

const NoMeetingCard = ({cardStyle}) => {
  return (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '30px 20px' }}>
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

export default NoMeetingCard