import { Clock, CheckCircle2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

const HasSignedInCard = ({meeting, hasSignedOut, cardStyle, attendance, member}) => {
    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                        Today's Meeting
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                        {meeting.title}
                    </div>
                </div>            
                {hasSignedOut ? (
                    <div style={{ background: '#e6f4ee', color: '#008751', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                        Completed
                    </div>
                ) : (
                    <div style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Clock size={12} /> Awaiting Sign-out
                    </div>
                )}
            </div>
                
            {hasSignedOut ? (
                <div style={{ background: '#e6f4ee', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#008751', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle2 size={18} />
                    Successfully signed out at {new Date(attendance.signed_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            ) : (
                <div style={{ background: '#f8faf9', borderRadius: '14px', padding: '14px', border: '1px solid #e8ece9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Attendance No.
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#008751' }}>
                                #{String(attendance.sequence_number).padStart(3, '0')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Signed In At
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d1b12' }}>
                                {new Date(attendance.signed_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                
                    {/* EXCO CONTINUOUS SCANNER QR CODE */}
                    <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a5e52', marginBottom: '10px' }}>
                            Present QR Code to EXCO to Sign Out
                        </div>
                
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px' }}>
                            <QRCodeSVG
                                value={JSON.stringify({
                                meetingId: meeting.id,
                                attendanceId: attendance.id,
                                confirmedName: `${member.first_name} ${member.last_name}`,
                                confirmedStateCode: member.state_code
                            })}
                                size={140}
                                level="M"
                                includeMargin={true}
                                fgColor="#008751" // Custom foreground color (e.g., Green)
                                bgColor="#FFFFFF"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HasSignedInCard