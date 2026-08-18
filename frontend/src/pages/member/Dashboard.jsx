// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext'
// import { getMyProfile } from '../../services/members.service'
// import { getActiveMeeting } from '../../services/meetings.service'
// import NotificationsModal from '../../components/common/NotificationsModal'
// import api from '../../services/api'
// import {
//     Bell, FileText, FilePlus,
//     KeyRound, ClipboardList, Wallet,
//     Home, Calendar, FileCheck, User,
//     Coins, LayoutDashboard, LogOut,
//     Settings2, MapPin, CalendarOff
// } from 'lucide-react'

// import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
// import { signIn } from '../../services/attendance.service'


// const s = {
//     page: {
//         minHeight: '100vh',
//         background: '#f2f4f7',
//         fontFamily: "'Plus Jakarta Sans', sans-serif",
//         maxWidth: '390px',
//         margin: '0 auto',
//         position: 'relative',
//         paddingBottom: '90px'
//     },
//     topbar: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '52px 20px 16px',
//         background: '#ffffff'
//     },
//     greetingLine: {
//         fontSize: '0.78rem',
//         color: '#8fa396',
//         fontWeight: 400,
//         marginBottom: '2px'
//     },
//     greetingName: {
//         fontSize: '1.2rem',
//         fontWeight: 700,
//         color: '#0d1b12'
//     },
//     topbarRight: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px'
//     },
//     notifWrap: {
//         position: 'relative',
//         width: '40px',
//         height: '40px',
//         background: '#f2f4f7',
//         borderRadius: '50%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         cursor: 'pointer'
//     },
//     notifPip: {
//         position: 'absolute',
//         top: '8px',
//         right: '8px',
//         width: '8px',
//         height: '8px',
//         background: '#e53e3e',
//         borderRadius: '50%',
//         border: '2px solid white'
//     },
//     avatar: {
//         width: '40px',
//         height: '40px',
//         borderRadius: '50%',
//         background: '#e6f4ee',
//         border: '2px solid #c2e0cf',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontWeight: 700,
//         fontSize: '0.78rem',
//         color: '#008751'
//     },
//     chipRow: {
//         background: '#ffffff',
//         padding: '0 20px 16px',
//         display: 'flex',
//         gap: '6px'
//     },
//     chip: (color = '#008751', bg = '#e6f4ee') => ({
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: '5px',
//         background: bg,
//         color: color,
//         fontSize: '0.72rem',
//         fontWeight: 600,
//         padding: '5px 10px',
//         borderRadius: '20px'
//     }),
//     chipDot: (color = '#008751') => ({
//         width: '6px',
//         height: '6px',
//         background: color,
//         borderRadius: '50%'
//     }),
//     content: { padding: '16px 20px 0' },
//     sectionHead: {
//         fontSize: '0.75rem',
//         fontWeight: 700,
//         color: '#8fa396',
//         textTransform: 'uppercase',
//         letterSpacing: '0.8px',
//         marginBottom: '10px'
//     },
//     card: {
//         background: '#ffffff',
//         borderRadius: '18px',
//         padding: '20px',
//         boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//         marginBottom: '14px'
//     },
//     cardSm: {
//         background: '#ffffff',
//         borderRadius: '12px',
//         padding: '16px',
//         boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//     },
//     bottomNav: {
//         position: 'fixed',
//         bottom: 0,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         width: '100%',
//         maxWidth: '390px',
//         background: '#ffffff',
//         borderTop: '1px solid #e8ece9',
//         display: 'flex',
//         padding: '10px 0 24px',
//         zIndex: 100,
//         boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
//     },
// }

// const MeetingCard = ({ meeting, member, handleSignIn, signingIn, signInError, userLocation, locationLoading }) => {
//     if (!meeting) {
//         return (
//             <div style={{ ...s.card, textAlign: 'center', padding: '30px 20px' }}>
//                 <CalendarOff size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
//                 <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
//                     No upcoming meeting
//                 </div>
//                 <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
//                     Check back later
//                 </div>
//             </div>
//         )
//     }

//     const meetingDate = new Date(meeting.meeting_date)
//     const day = meetingDate.getUTCDate()
//     const month = meetingDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' })
//     const signInOpen = new Date(meeting.sign_in_open)
//     const signInClose = new Date(meeting.sign_in_close)
//     const lateThreshold = new Date(meeting.late_threshold)

//     const formatTime = (date) => date.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit'
//     })

//     if (meeting.state === 'upcoming') {
//         return (
//             <div style={s.card}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
//                     <div style={{
//                         background: '#008751',
//                         borderRadius: '10px',
//                         padding: '10px 12px',
//                         textAlign: 'center',
//                         flexShrink: 0
//                     }}>
//                         <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{day}</div>
//                         <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{month}</div>
//                     </div>
//                     <div style={{ flex: 1 }}>
//                         <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#008751', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>
//                             Upcoming Meeting
//                         </div>
//                         <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '3px' }}>
//                             {meeting.title}
//                         </div>
//                         <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
//                             Opens at {formatTime(signInOpen)}
//                         </div>
//                     </div>
//                     <div style={{
//                         background: '#e6f4ee',
//                         color: '#008751',
//                         fontSize: '0.68rem',
//                         fontWeight: 700,
//                         padding: '4px 10px',
//                         borderRadius: '20px',
//                         flexShrink: 0
//                     }}>
//                         {meeting.meeting_cost} token
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     if (meeting.state === 'today_not_open') {
//         return (
//             <div style={s.card}>
//                 <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
//                     Today's Meeting
//                 </div>
//                 <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
//                     {meeting.title}
//                 </div>
//                 <div style={{ background: '#f2f4f7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
//                     <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500 }}>
//                         Sign-in opens at <strong style={{ color: '#008751' }}>{formatTime(signInOpen)}</strong>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     if (meeting.state === 'open_on_time' || meeting.state === 'open_late') {
//         const isLate = meeting.state === 'open_late'
//         const totalCost = isLate
//             ? meeting.meeting_cost + meeting.lateness_cost
//             : meeting.meeting_cost

//         const venueLat = parseFloat(meeting.venue_lat)
//         const venueLng = parseFloat(meeting.venue_lng)

//         return (
//             <div style={s.card}>
//                 <div style={{
//                     display: 'flex',
//                     alignItems: 'flex-start',
//                     justifyContent: 'space-between',
//                     marginBottom: '14px'
//                 }}>
//                     <div>
//                         <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
//                             Today's Meeting
//                         </div>
//                         <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
//                             {meeting.title}
//                         </div>
//                     </div>
//                     <div style={{
//                         background: isLate ? '#fff8e6' : '#e6f4ee',
//                         color: isLate ? '#d4900a' : '#008751',
//                         fontSize: '0.7rem',
//                         fontWeight: 600,
//                         padding: '4px 10px',
//                         borderRadius: '20px',
//                         whiteSpace: 'nowrap'
//                     }}>
//                         {isLate ? 'Late' : 'On time'}
//                     </div>
//                 </div>

//                 {/* MAP */}
//                 <div style={{
//                     borderRadius: '12px',
//                     overflow: 'hidden',
//                     marginBottom: '14px',
//                     height: '160px'
//                 }}>
//                     {userLocation ? (
//                         <MapContainer
//                             center={[venueLat, venueLng]}
//                             zoom={17}
//                             style={{ height: '160px', width: '100%' }}
//                             zoomControl={false}
//                             scrollWheelZoom={false}
//                             dragging={false}
//                         >
//                             <TileLayer
//                                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                                 attribution=""
//                             />
//                             {/* Venue marker */}
//                             <Marker position={[venueLat, venueLng]} />
//                             {/* Geofence circle */}
//                             <Circle
//                                 center={[venueLat, venueLng]}
//                                 radius={meeting.radius_meters}
//                                 pathOptions={{ color: '#008751', fillColor: '#008751', fillOpacity: 0.1 }}
//                             />
//                             {/* Member location */}
//                             <Marker
//                                 position={[userLocation.lat, userLocation.lng]}
//                             />
//                         </MapContainer>
//                     ) : (
//                         <div style={{
//                             height: '160px',
//                             background: '#f2f4f7',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             fontSize: '0.78rem',
//                             color: '#8fa396'
//                         }}>
//                             {locationLoading ? 'Getting your location...' : 'Location unavailable'}
//                         </div>
//                     )}
//                 </div>

//                 {/* ERROR */}
//                 {signInError && (
//                     <div style={{
//                         background: '#fff0f0',
//                         color: '#e53e3e',
//                         fontSize: '0.78rem',
//                         padding: '10px 14px',
//                         borderRadius: '10px',
//                         marginBottom: '12px',
//                         textAlign: 'center'
//                     }}>
//                         {signInError}
//                     </div>
//                 )}

//                 {/* RIPPLE BUTTON */}
//                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
//                     <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <div style={{
//                             position: 'absolute',
//                             width: '140px', height: '140px',
//                             borderRadius: '50%',
//                             border: '1.5px solid rgba(0,135,81,0.2)',
//                             animation: 'ripple 2s ease-out infinite'
//                         }} />
//                         <div style={{
//                             position: 'absolute',
//                             width: '165px', height: '165px',
//                             borderRadius: '50%',
//                             border: '1.5px solid rgba(0,135,81,0.12)',
//                             animation: 'ripple 2s ease-out infinite',
//                             animationDelay: '0.5s'
//                         }} />
//                         <button
//                             onClick={handleSignIn}
//                             disabled={member.token_balance < totalCost || signingIn || !userLocation}
//                             style={{
//                                 width: '110px', height: '110px',
//                                 borderRadius: '50%',
//                                 background: member.token_balance < totalCost || !userLocation
//                                     ? '#c2e0cf' : '#008751',
//                                 border: 'none',
//                                 cursor: member.token_balance < totalCost || signingIn || !userLocation
//                                     ? 'not-allowed' : 'pointer',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 flexDirection: 'column',
//                                 gap: '6px',
//                                 boxShadow: '0 4px 20px rgba(0,135,81,0.35)',
//                                 position: 'relative',
//                                 zIndex: 1
//                             }}
//                         >
//                             <MapPin size={28} color="white" />
//                             <span style={{
//                                 fontSize: '0.58rem',
//                                 fontWeight: 700,
//                                 color: 'rgba(255,255,255,0.9)',
//                                 letterSpacing: '0.5px',
//                                 textTransform: 'uppercase',
//                                 textAlign: 'center',
//                                 padding: '0 8px'
//                             }}>
//                                 {signingIn ? 'Signing in...'
//                                     : member.token_balance < totalCost ? 'No tokens'
//                                     : !userLocation ? 'No GPS'
//                                     : 'Tap to sign in'}
//                             </span>
//                         </button>
//                     </div>

//                     <div style={{ textAlign: 'center' }}>
//                         <div style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 500, marginBottom: '3px' }}>
//                             Closes at {formatTime(signInClose)}
//                         </div>
//                         <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
//                             {isLate
//                                 ? <span>Late fee · <strong style={{ color: '#d4900a' }}>{totalCost} tokens</strong></span>
//                                 : <span>Late after {formatTime(lateThreshold)} · <strong style={{ color: '#d4900a' }}>+{meeting.lateness_cost} token</strong></span>
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     if (meeting.state === 'sign_in_closed') {
//         return (
//             <div style={s.card}>
//                 <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
//                     Today's Meeting
//                 </div>
//                 <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>
//                     {meeting.title}
//                 </div>
//                 <div style={{ background: '#fff0f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
//                     <div style={{ fontSize: '0.8rem', color: '#e53e3e', fontWeight: 500 }}>
//                         Sign-in is closed
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return null
// }

// export default function Dashboard() {
//     const { member: authMember, logout } = useAuth()
//     const navigate = useNavigate()

//     const [member, setMember] = useState(null)
//     const [meeting, setMeeting] = useState(null)
//     const [unreadCount, setUnreadCount] = useState(0)
//     const [loading, setLoading] = useState(true)
//     const [showNotifications, setShowNotifications] = useState(false)
//     const [todayStatus, setTodayStatus] = useState(null)
//     const [recentAttendance, setRecentAttendance] = useState([])
//     const [signingIn, setSigningIn] = useState(false)
//     const [signInError, setSignInError] = useState('')
//     const [signInSuccess, setSignInSuccess] = useState(null)
//     const [userLocation, setUserLocation] = useState(null)
//     const [locationLoading, setLocationLoading] = useState(false)
//     // In the tabs array, update onClick handlers
// // Replace setActiveTab with navigate for role-specific 

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [memberRes, meetingRes, todayRes, attendanceRes] = await Promise.all([
//                     getMyProfile(),
//                     getActiveMeeting(),
//                     api.get('/attendance/today'),
//                     api.get('/attendance/me')
//                 ])
//                 setMember(memberRes.data)
//                 setMeeting(meetingRes.data)
//                 setTodayStatus(todayRes.data.data)
//                 setRecentAttendance(attendanceRes.data.data.slice(0, 3))
//             } catch (err) {
//                 console.error(err)
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchData()
//     }, [])

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [memberRes, meetingRes] = await Promise.all([
//                     getMyProfile(),
//                     getActiveMeeting()
//                 ])
//                 setMember(memberRes.data)
//                 setMeeting(meetingRes.data)
//             } catch (err) {
//                 console.error(err)
//             } finally {
//                 setLoading(false)
//             }
//         }
//         fetchData()
//     }, [])
//     useEffect(() => {
//     const fetchUnread = async () => {
//         try {
//             const result = await api.get('/notifications/unread')
//             setUnreadCount(result.data.data.count)
//         } catch (err) {
//             console.error(err)
//         }
//     }
//     fetchUnread()
//     }, [])
//     useEffect(() => {
//         if (meeting?.state === 'open_on_time' || meeting?.state === 'open_late') {
//             setLocationLoading(true)
//             navigator.geolocation.getCurrentPosition(
//                 (pos) => {
//                     setUserLocation({
//                         lat: pos.coords.latitude,
//                         lng: pos.coords.longitude
//                     })
//                     setLocationLoading(false)
//                 },
//                 () => {
//                     setLocationLoading(false)
//                 },
//                 { enableHighAccuracy: true }
//             )
//         }
//     }, [meeting?.state])

//     const handleSignIn = async () => {
//         if (!userLocation) {
//             setSignInError('Could not get your location. Please enable GPS.')
//             return
//         }
//         setSigningIn(true)
//         setSignInError('')
//         try {
//             const result = await signIn(userLocation.lat, userLocation.lng)
//             setSignInSuccess(result.data)
//             // Refresh member data to update token balance
//             const memberRes = await getMyProfile()
//             setMember(memberRes.data)
//             // Refresh meeting state
//             const meetingRes = await getActiveMeeting()
//             setMeeting(meetingRes.data)
//         } catch (err) {
//             setSignInError(err.response?.data?.message || 'Sign in failed')
//         } finally {
//             setSigningIn(false)
//         }
//     }

//     if (loading) {
//         return (
//             <div style={{
//                 minHeight: '100vh',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontFamily: "'Plus Jakarta Sans', sans-serif",
//                 color: '#8fa396',
//                 fontSize: '0.88rem'
//             }}>
//                 Loading...
//             </div>
//         )
//     }

//     if (!member) return null

//     const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
//     const today = new Date().toLocaleDateString('en-US', {
//         weekday: 'long',
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//     })

//     const quickActions = [
//         { icon: <FileCheck size={18} color="#008751" />, label: 'Clearance Slip', bg: '#e6f4ee', path: '/clearance' },
//         { icon: <FilePlus size={18} color="#e53e3e" />, label: 'File Excuse', bg: '#fff0f0', path: '/excuse' },
//         { icon: <KeyRound size={18} color="#d4900a" />, label: 'Reset PIN', bg: '#fff8e6', path: '/reset-pin' },
//         { icon: <ClipboardList size={18} color="#4f46e5" />, label: 'My Record', bg: '#eef2ff', path: '/attendance' }
//     ]


//     return (
//         <>
//             <style>{`
//                 @keyframes ripple {
//                     0% { opacity: 1; transform: scale(0.95); }
//                     100% { opacity: 0; transform: scale(1.08); }
//                 }
//             `}</style>

//             <div style={s.page}>

//                 {/* TOP BAR */}
//                 <div style={s.topbar}>
//                     <div>
//                         <div style={s.greetingLine}>{today}</div>
//                         <div style={s.greetingName}>
//                             Hey, <span style={{ color: '#008751' }}>{member.first_name}</span> 👋
//                         </div>
//                     </div>
//                     <div style={s.topbarRight}>
//                        <div style={s.notifWrap} onClick={() => setShowNotifications(true)}>
//                             <Bell size={20} color="#4a5e52" />
//                             {unreadCount > 0 && <div style={s.notifPip} />}
//                         </div>
//                         <NotificationsModal
//                             isOpen={showNotifications}
//                             onClose={() => setShowNotifications(false)}
//                             onRead={(count) => setUnreadCount(count)}
//                         />
//                         <div style={s.avatar}>{initials}</div>
//                     </div>
//                 </div>

//                 {/* CHIPS */}
//                 <div style={s.chipRow}>
//                     <div style={s.chip()}>
//                         <div style={s.chipDot()} />
//                         {member.state_code}
//                     </div>
//                     <div style={s.chip('#d4900a', '#fff8e6')}>
//                         <Wallet size={10} color="#d4900a" />
//                         {member.token_balance} Token{member.token_balance !== 1 ? 's' : ''}
//                     </div>
//                 </div>

//                 {/* CONTENT */}
//                 <div style={s.content}>

//                     {/* MEETING CARD */}
//                    <MeetingCard
//                         meeting={meeting}
//                         member={member}
//                         onSignIn={handleSignIn}
//                         signingIn={signingIn}
//                         signInError={signInError}
//                         userLocation={userLocation}
//                         locationLoading={locationLoading}
//                     />

//                     {/* STATS ROW */}
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
//                         <div style={s.cardSm}>
//                             <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
//                                 Token Balance
//                             </div>
//                             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#008751', lineHeight: 1, marginBottom: '4px' }}>
//                                 {member.token_balance}
//                             </div>
//                             <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
//                                 ≈ ₦{(member.token_balance * 500).toLocaleString()} value
//                             </div>
//                         </div>
//                         <div style={s.cardSm}>
//                             <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
//                                 Service Year
//                             </div>
//                             <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1b12', lineHeight: 1, marginBottom: '2px' }}>
//                                 {member?.stream_year} Batch {member?.stream_batch}
//                             </div>
//                             <div style={{ fontSize: '0.7rem', color: '#8fa396', marginBottom: '10px' }}>
//                                 Ends {new Date(member?.service_end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
//                             </div>

//                             {/* PROGRESS BAR */}
//                             {(() => {
//                                 const start = new Date(member?.callup_date)
//                                 const end = new Date(member?.service_end)
//                                 const now = new Date()
//                                 const total = end - start
//                                 const elapsed = now - start
//                                 const percent = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100)
//                                 const monthsLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24 * 30)))
                            
//                                 return (
//                                     <>
//                                         <div style={{
//                                             width: '100%',
//                                             height: '6px',
//                                             background: '#f2f4f7',
//                                             borderRadius: '3px',
//                                             overflow: 'hidden',
//                                             marginBottom: '6px'
//                                         }}>
//                                             <div style={{
//                                                 height: '100%',
//                                                 width: `${percent}%`,
//                                                 background: percent >= 90
//                                                     ? '#e53e3e'
//                                                     : percent >= 70
//                                                         ? '#d4900a'
//                                                         : '#008751',
//                                                 borderRadius: '3px',
//                                                 transition: 'width 0.5s ease'
//                                             }} />
//                                         </div>
//                                         <div style={{
//                                             display: 'flex',
//                                             justifyContent: 'space-between',
//                                             fontSize: '0.65rem',
//                                             color: '#8fa396'
//                                         }}>
//                                             {/* <span>{percent}% complete</span> */}
//                                             <span>{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>
//                                         </div>
//                                     </>
//                                 )
//                             })()}
//                         </div>
//                     </div>

//                     {/* QUICK ACTIONS */}
//                     <div style={s.sectionHead}>Quick Actions</div>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
//                         {quickActions.map((action) => (
//                             <div
//                                 key={action.label}
//                                 onClick={() => navigate(action.path)}
//                                 style={{
//                                     background: '#ffffff',
//                                     borderRadius: '12px',
//                                     padding: '12px 6px',
//                                     display: 'flex',
//                                     flexDirection: 'column',
//                                     alignItems: 'center',
//                                     gap: '6px',
//                                     boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//                                     cursor: 'pointer'
//                                 }}
//                             >
//                                 <div style={{
//                                     width: '36px',
//                                     height: '36px',
//                                     borderRadius: '10px',
//                                     background: action.bg,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center'
//                                 }}>
//                                     {action.icon}
//                                 </div>
//                                 <div style={{
//                                     fontSize: '0.6rem',
//                                     fontWeight: 600,
//                                     color: '#4a5e52',
//                                     textAlign: 'center',
//                                     lineHeight: 1.3
//                                 }}>
//                                     {action.label}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* RECENT ATTENDANCE */}
//                <div style={s.sectionHead}>Recent Attendance</div>
//                 {recentAttendance.length === 0 ? (
//                     <div style={{
//                         background: '#ffffff',
//                         borderRadius: '12px',
//                         padding: '20px',
//                         boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//                         textAlign: 'center',
//                         color: '#8fa396',
//                         fontSize: '0.82rem'
//                     }}>
//                         No attendance records yet
//                     </div>
//                 ) : (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                         {recentAttendance.map(record => {
//                             const isPresent = record.signed_out_at || record.excuse_id || record.marked_present_by
//                             const meetingDate = new Date(record.meeting_date)
//                             return (
//                                 <div key={record.id} style={{
//                                     background: '#ffffff',
//                                     borderRadius: '12px',
//                                     padding: '13px 16px',
//                                     boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: '12px'
//                                 }}>
//                                     <div style={{
//                                         width: '36px',
//                                         height: '36px',
//                                         borderRadius: '10px',
//                                         background: isPresent ? '#e6f4ee' : '#fff0f0',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         flexShrink: 0
//                                     }}>
//                                         <span style={{ fontSize: '0.9rem' }}>
//                                             {isPresent ? '✓' : '✗'}
//                                         </span>
//                                     </div>
//                                     <div style={{ flex: 1 }}>
//                                         <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
//                                             {record.title}
//                                         </div>
//                                         <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>
//                                             {meetingDate.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
//                                         </div>
//                                     </div>
//                                     <div style={{
//                                         fontSize: '0.65rem',
//                                         fontWeight: 700,
//                                         padding: '3px 9px',
//                                         borderRadius: '20px',
//                                         background: isPresent ? '#e6f4ee' : '#fff0f0',
//                                         color: isPresent ? '#008751' : '#e53e3e'
//                                     }}>
//                                         {isPresent ? 'Present' : 'Absent'}
//                                     </div>
//                                 </div>
//                             )
//                         })}
//                         <div
//                             onClick={() => navigate('/attendance')}
//                             style={{
//                                 textAlign: 'center',
//                                 fontSize: '0.75rem',
//                                 fontWeight: 600,
//                                 color: '#008751',
//                                 padding: '8px',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             View full record →
//                         </div>
//                     </div>
//                 )}

//                 </div>
//             </div>

    
//         </>
//     )
// }

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyProfile } from '../../services/members.service'
import { getActiveMeeting } from '../../services/meetings.service'
import { signIn } from '../../services/attendance.service'
import api from '../../services/api'

import { UserTopBar } from '../../components/dashboard/UserTopBar'
import { MemberChips } from '../../components/dashboard/MemberChips'
import { MeetingCard } from '../../components/dashboard/MeetingCard'
import { ServiceProgressCard } from '../../components/dashboard/ServiceProgressCard'
import { QuickActionsGrid } from '../../components/dashboard/QuickActionsGrid'
import { RecentAttendanceList } from '../../components/dashboard/RecentAttendanceList'

export default function Dashboard() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const [member, setMember] = useState(null)
    const [meeting, setMeeting] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showNotifications, setShowNotifications] = useState(false)
    const [recentAttendance, setRecentAttendance] = useState([])
    const [signingIn, setSigningIn] = useState(false)
    const [signInError, setSignInError] = useState('')
    const [userLocation, setUserLocation] = useState(null)
    const [locationLoading, setLocationLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, meetingRes, attendanceRes, unreadRes] = await Promise.all([
                    getMyProfile(),
                    getActiveMeeting(),
                    api.get('/attendance/me'),
                    api.get('/notifications/unread')
                ])
                setMember(memberRes.data)
                setMeeting(meetingRes.data)
                setRecentAttendance(attendanceRes.data.data.slice(0, 3))
                setUnreadCount(unreadRes.data.data.count)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (meeting?.state === 'open_on_time' || meeting?.state === 'open_late') {
            setLocationLoading(true)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                    setLocationLoading(false)
                },
                () => {
                    setLocationLoading(false)
                },
                { enableHighAccuracy: true }
            )
        }
    }, [meeting?.state])

    const handleSignIn = async () => {
        if (!userLocation) {
            setSignInError('Could not get your location. Please enable GPS.')
            return
        }
        setSigningIn(true)
        setSignInError('')
        try {
            await signIn(userLocation.lat, userLocation.lng)
            const [memberRes, meetingRes] = await Promise.all([
                getMyProfile(),
                getActiveMeeting()
            ])
            setMember(memberRes.data)
            setMeeting(meetingRes.data)
        } catch (err) {
            setSignInError(err.response?.data?.message || 'Sign in failed')
        } finally {
            setSigningIn(false)
        }
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#8fa396',
                fontSize: '0.88rem'
            }}>
                Loading...
            </div>
        )
    }

    if (!member) return null

    const initials = `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()

    return (
        <>
            <style>{`
                @keyframes ripple {
                    0% { opacity: 1; transform: scale(0.95); }
                    100% { opacity: 0; transform: scale(1.08); }
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: '#f2f4f7',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                maxWidth: '390px',
                margin: '0 auto',
                position: 'relative',
                paddingBottom: '90px'
            }}>
                <UserTopBar
                    firstName={member.first_name}
                    initials={initials}
                    unreadCount={unreadCount}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    setUnreadCount={setUnreadCount}
                />

                <MemberChips
                    stateCode={member.state_code}
                    tokenBalance={member.token_balance}
                />

                <div style={{ padding: '16px 20px 0' }}>
                    <MeetingCard
                        meeting={meeting}
                        member={member}
                        handleSignIn={handleSignIn}
                        signingIn={signingIn}
                        signInError={signInError}
                        userLocation={userLocation}
                        locationLoading={locationLoading}
                    />

                    {/* STATS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                        }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                Token Balance
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#008751', lineHeight: 1, marginBottom: '4px' }}>
                                {member.token_balance}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                ≈ ₦{(member.token_balance * 500).toLocaleString()} value
                            </div>
                        </div>

                        <ServiceProgressCard member={member} />
                    </div>

                    <QuickActionsGrid onNavigate={navigate} />

                    <RecentAttendanceList
                        attendance={recentAttendance}
                        onNavigate={navigate}
                    />
                </div>
            </div>
        </>
    )
}