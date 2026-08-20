import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyProfile } from '../../services/members.service'
import { getActiveMeeting } from '../../services/meetings.service'
import { signIn, getMyAttendance } from '../../services/attendance.service'
import api from '../../services/api'

import { UserTopBar } from '../../components/dashboard/UserTopBar'
import { MemberChips } from '../../components/dashboard/MemberChips'
import { MeetingCard } from '../../components/dashboard/MeetingCard'
import { ServiceProgressCard } from '../../components/dashboard/ServiceProgressCard'
import { QuickActionsGrid } from '../../components/dashboard/QuickActionsGrid'
import { RecentAttendanceList } from '../../components/dashboard/RecentAttendanceList'
import { getStableLocation } from '../../utils/usePreciseLocation'

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
    const [attendance, setAttendance] = useState(null)
    
    // Update fetchData to include today's attendance
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
                setUnreadCount(unreadRes.data.data.count)
            
                const allAttendance = attendanceRes.data.data
                setRecentAttendance(allAttendance.slice(0, 3))
            
                // Find today's attendance record
                const today = new Date().toISOString().split('T')[0]
                const todayRecord = allAttendance.find(a => {
                    const recordDate = new Date(a.meeting_date).toISOString().split('T')[0]
                    return recordDate === today
                })
                setAttendance(todayRecord || null)
            
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
            getStableLocation()
                .then(location => {
                    setUserLocation(location)
                    setLocationLoading(false)
                })
                .catch(() => {
                    setLocationLoading(false)
                })
        }
    }, [meeting?.state])
    // Update handleSignIn to refresh attendance
    const handleSignIn = async () => {
        if (!userLocation) {
            setSignInError('Could not get your location. Please enable GPS.')
            return
        }
        setSigningIn(true)
        setSignInError('')
        try {
            await signIn(userLocation.lat, userLocation.lng)
        
            const [memberRes, meetingRes, attendanceRes] = await Promise.all([
                getMyProfile(),
                getActiveMeeting(),
                api.get('/attendance/me')
            ])
        
            setMember(memberRes.data)
            setMeeting(meetingRes.data)
        
            const allAttendance = attendanceRes.data.data
            setRecentAttendance(allAttendance.slice(0, 3))
        
            const today = new Date().toISOString().split('T')[0]
            const todayRecord = allAttendance.find(a => {
                const recordDate = new Date(a.meeting_date).toISOString().split('T')[0]
                return recordDate === today
            })
            setAttendance(todayRecord || null)
        
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
                        attendance={attendance} 
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