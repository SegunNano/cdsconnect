import VenueMap from './meeting-cards/VenueMap'
import NoMeetingCard from './meeting-cards/NoMeetingCard'
import HasSignedInCard from './meeting-cards/HasSignedInCard'
import UpcomingCard from './meeting-cards/UpcomingCard'
import TodayNotOpen from './meeting-cards/TodayNotOpen'
import { useState } from 'react'
import { CheckCircle2, FileText, Award, AlertCircle} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'


function TodaysMeeting () {
    return (
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Today's Meeting
        </div>
    )
}

export function MeetingCard({ meeting, member, attendance, signingIn, signInError, userLocation, handleSignIn, todayAttendance, certStatus }) {

    const [paying, setPaying] = useState(false)
    const [payError, setPayError] = useState('')
    const [paid, setPaid] = useState(false)
    const navigate = useNavigate()


    const cardStyle = {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '14px'
    }
    const handlePayCertificate = async () => {
        setPaying(true)
        setPayError('')
        try {
            await api.post('/certificates/pay')
            setPaid(true)
        } catch (err) {
            setPayError(err.response?.data?.message || 'Payment failed')
        } finally {
            setPaying(false)
        }
    }
    
    // ── CERTIFICATE PAYMENT CARD ─────────────────────────────
    // Shows instead of meeting card when batch is outgoing
    if (certStatus?.certificate_unlocked && !certStatus?.has_paid && !paid) {
        const canAfford = member.token_balance >= certStatus.certificate_cost_tokens
    
        return (
            <div style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                marginBottom: '14px',
                border: '2px solid #e6f4ee'
            }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: '#e6f4ee', borderRadius: '14px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                    }}>
                        <Award size={24} color="#008751" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                            Service Complete
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                            Collect Your Certificate{certStatus.is_exco ? 's' : ''}
                        </div>
                    </div>
                </div>
    
                {/* BATCH */}
                <div style={{
                    background: '#f8fdf9', borderRadius: '12px',
                    padding: '12px 14px', marginBottom: '14px'
                }}>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        You will receive
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0d1b12' }}>
                            <FileText size={14} color="#008751" />
                            Certificate of Membership
                        </div>
                        {certStatus.is_exco && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0d1b12' }}>
                                <Award size={14} color="#b8860b" />
                                Certificate of Excellence
                            </div>
                        )}
                    </div>
                </div>
    
                {/* COST */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                }}>
                    <div style={{ fontSize: '0.82rem', color: '#4a5e52' }}>Cost</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d4900a' }}>
                        {certStatus.certificate_cost_tokens} token{certStatus.certificate_cost_tokens !== 1 ? 's' : ''}
                        <span style={{ fontSize: '0.72rem', color: '#8fa396', fontWeight: 400, marginLeft: '6px' }}>
                            ₦{(certStatus.certificate_cost_tokens * 500).toLocaleString()}
                        </span>
                    </div>
                </div>
    
                <div style={{ fontSize: '0.72rem', color: '#8fa396', marginBottom: '14px' }}>
                    Your balance: {member.token_balance} token{member.token_balance !== 1 ? 's' : ''}
                    {!canAfford && (
                        <span style={{ color: '#e53e3e', display: 'block', marginTop: '2px' }}>
                            Insufficient tokens — contact treasurer to top up
                        </span>
                    )}
                </div>
    
                {payError && (
                    <div style={{
                        background: '#fff0f0', color: '#e53e3e',
                        fontSize: '0.78rem', padding: '10px 12px',
                        borderRadius: '10px', marginBottom: '12px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <AlertCircle size={14} color="#e53e3e" />
                        {payError}
                    </div>
                )}
    
                <button
                    onClick={handlePayCertificate}
                    disabled={paying || !canAfford}
                    style={{
                        width: '100%',
                        background: paying || !canAfford ? '#c2e0cf' : '#008751',
                        border: 'none', borderRadius: '12px',
                        padding: '14px',
                        cursor: paying || !canAfford ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem', fontWeight: 700,
                        color: 'white',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    {paying
                        ? 'Processing...'
                        : `Pay ${certStatus.certificate_cost_tokens} Token${certStatus.certificate_cost_tokens !== 1 ? 's' : ''}`
                    }
                </button>
            </div>
        )
    }
    
    // ── PAID — show success and point to clearance ───────────
    if ((certStatus?.has_paid || paid) && certStatus?.certificate_unlocked) {
        return (
            <div style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                marginBottom: '14px'
            }}>
                <div style={{
                    background: '#e6f4ee', borderRadius: '14px',
                    padding: '16px', display: 'flex',
                    alignItems: 'center', gap: '12px',
                    marginBottom: '14px'
                }}>
                    <CheckCircle2 size={24} color="#008751" />
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#008751', marginBottom: '2px' }}>
                            Payment Successful
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#4a5e52' }}>
                            Your certificate{certStatus.is_exco ? 's are' : ' is'} ready
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#4a5e52', textAlign: 'center', marginBottom: '14px' }}>
                    Download your certificate{certStatus.is_exco ? 's' : ''} from the Clearance section
                </div>
                <button
                    onClick={() => navigate('/clearance')}
                    style={{
                        width: '100%',
                        background: '#008751', border: 'none',
                        borderRadius: '12px', padding: '13px',
                        cursor: 'pointer', fontSize: '0.88rem',
                        fontWeight: 700, color: 'white',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px'
                    }}
                >
                    <FileText size={16} color="white" />
                    Go to Clearance
                </button>
            </div>
        )
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

    // FIX: Fallback to todayAttendance if top-level attendance prop is null
    const activeAttendance = attendance || todayAttendance

    // Check attendance status flags using the combined active record
    const hasSignedIn = Boolean(activeAttendance?.signed_in_at)
    const hasSignedOut = Boolean(activeAttendance?.signed_out_at)

    // ==========================================
    // 1. SIGNED-IN / SIGNED-OUT CARD STATES
    // ==========================================
    if (hasSignedIn) {
        return (
            <HasSignedInCard
                hasSignedOut={hasSignedOut}
                cardStyle={cardStyle}
                meeting={meeting}
                attendance={activeAttendance} // Pass the resolved record here
                member={member}
            />
        )
    }

    // ... (rest of your state conditions remain unchanged)
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