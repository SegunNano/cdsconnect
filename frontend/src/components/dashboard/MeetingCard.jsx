import VenueMap from './meeting-cards/VenueMap'
import NoMeetingCard from './meeting-cards/NoMeetingCard'
import HasSignedInCard from './meeting-cards/HasSignedInCard'
import UpcomingCard from './meeting-cards/UpcomingCard'
import TodayNotOpen from './meeting-cards/TodayNotOpen'



function TodaysMeeting () {
    return (
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Today's Meeting
        </div>
    )
}

export function MeetingCard({ meeting, member, attendance, signingIn, signInError, userLocation, handleSignIn, todayAttendance }) {
    
    const cardStyle = {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '14px'
    }

    if (!meeting) {
        return (
           <NoMeetingCard cardStyle={cardStyle} /> 
        )
    }

    const meetingDate = new Date(meeting.meeting_date)
    const day = meetingDate.getUTCDate()
    const month = meetingDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)

    const formatTime = (date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    // Check attendance status flags
    const hasSignedIn = Boolean(attendance?.signed_in_at)
    const hasSignedOut = Boolean(attendance?.signed_out_at)

    // ==========================================
    // 1. SIGNED-IN / SIGNED-OUT CARD STATES
    // ==========================================
    if (hasSignedIn) {
        return (
            <HasSignedInCard
                hasSignedOut={hasSignedOut}
                cardStyle={cardStyle}
                meeting={meeting}
                attendance={todayAttendance}
                member={member}
            />
        )
    }

    // ==========================================
    // 2. UPCOMING MEETING STATE
    // ==========================================
    if (meeting.state === 'upcoming') {
        return (
            <UpcomingCard
                day={day}
                cardStyle={cardStyle}
                month={month}
                meeting={meeting}
                signInOpen={signInOpen}
                formatTime={formatTime}
            />
        )
    }

    // ==========================================
    // 3. TODAY (NOT YET OPEN) STATE
    // ==========================================
    if (meeting.state === 'today_not_open') {
        return (
           <TodayNotOpen
                signInOpen={signInOpen}
                meeting={meeting}
                formatTime={formatTime}
                cardStyle={cardStyle} 
                TodaysMeeting={TodaysMeeting}
            />
        )
    }

    // ==========================================
    // 4. SIGN-IN OPEN (ON TIME / LATE) STATE
    // ==========================================
    if (meeting.state === 'open_on_time' || meeting.state === 'open_late') {
      return (
        <VenueMap
            meeting={meeting}
            userLocation={userLocation}
            cardStyle={cardStyle}
            signInClose={signInClose}
            signInError={signInError}
            signingIn={signingIn}
            formatTime={formatTime}
            member={member}
            handleSignIn={handleSignIn}
        />
      )
    }

    // ==========================================
    // 5. SIGN-IN CLOSED STATE
    // ==========================================
    if (meeting.state === 'sign_in_closed') {
        return (
            <div style={cardStyle}>
                <TodaysMeeting />
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