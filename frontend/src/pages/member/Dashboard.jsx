import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getActiveMeeting } from '../../services/meetings.service'
import { signIn, getTodayStatus, getMyAttendance } from '../../services/attendance.service'
import api from '../../services/api'

import { UserTopBar } from '../../components/dashboard/UserTopBar'
import { MemberChips } from '../../components/dashboard/MemberChips'
import { MeetingCard } from '../../components/dashboard/MeetingCard'
import { ServiceProgressCard } from '../../components/dashboard/ServiceProgressCard'
import { QuickActionsGrid } from '../../components/dashboard/QuickActionsGrid'
import { RecentAttendanceList } from '../../components/dashboard/RecentAttendanceList'
import { getStableLocation } from '../../utils/usePreciseLocation'

export default function Dashboard() {
    const navigate = useNavigate()
    
    // Get member state directly from AuthContext
    const { member } = useAuth()

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
    const [todayAttendance, setTodayAttendance] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!member) return

            try {
                // Fetch secondary endpoints safely using updated service functions
                const [meetingRes, attendanceRes, unreadRes, todayAttendanceRes] = await Promise.allSettled([
                    getActiveMeeting(),
                    getMyAttendance(),
                    api.get('/notifications/unread'),
                    getTodayStatus()
                ])

                if (meetingRes.status === 'fulfilled') {
                    const res = meetingRes.value
                    setMeeting(res?.data || res)
                }

                if (unreadRes.status === 'fulfilled') {
                    const res = unreadRes.value
                    setUnreadCount(res?.data?.count ?? res?.count ?? 0)
                }

                if (todayAttendanceRes.status === 'fulfilled') {
                    const res = todayAttendanceRes.value
                    setTodayAttendance(res?.attendance || res?.data?.attendance || null)
                }

                if (attendanceRes.status === 'fulfilled') {
                    const res = attendanceRes.value
                    const allAttendance = res?.data || res || []
                    const attendanceList = Array.isArray(allAttendance) ? allAttendance : []
                    
                    setRecentAttendance(attendanceList.slice(0, 3))

                    console.log({attendanceList})

                    const today = new Date().toISOString().split('T')[0]
                    const todayRecord = attendanceList.find(a => {
                        if (!a?.meeting_date) return false
                        const recordDate = new Date(a.meeting_date).toISOString().split('T')[0]
                        return recordDate === today
                    })
                    setAttendance(todayRecord || null)
                }
            } catch (err) {
                console.error('Non-critical dashboard fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [member])

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

    const handleSignIn = async () => {
        if (!userLocation) {
            setSignInError('Could not get your location. Please enable GPS.')
            return
        }
        setSigningIn(true)
        setSignInError('')
        try {
            await signIn(userLocation.lat, userLocation.lng)

            const [meetingRes, attendanceRes, todayAttendanceRes] = await Promise.allSettled([
                getActiveMeeting(),
                getMyAttendance(),
                getTodayStatus()
            ])

            if (meetingRes.status === 'fulfilled') {
                const res = meetingRes.value
                setMeeting(res?.data || res)
            }

            if (todayAttendanceRes.status === 'fulfilled') {
                const res = todayAttendanceRes.value
                setTodayAttendance(res?.attendance || res?.data?.attendance || null)
            }

            if (attendanceRes.status === 'fulfilled') {
                const res = attendanceRes.value
                const allAttendance = res?.data || res || []
                const attendanceList = Array.isArray(allAttendance) ? allAttendance : []

                setRecentAttendance(attendanceList.slice(0, 3))

                const today = new Date().toISOString().split('T')[0]
                const todayRecord = attendanceList.find(a => {
                    if (!a?.meeting_date) return false
                    const recordDate = new Date(a.meeting_date).toISOString().split('T')[0]
                    return recordDate === today
                })
                setAttendance(todayRecord || null)
            }
        } catch (err) {
            setSignInError(err.response?.data?.message || 'Sign in failed')
        } finally {
            setSigningIn(false)
        }
    }

    if (!member) return null

    const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase()

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
                    breakoutSession={member.breakout_session}
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
                        todayAttendance={todayAttendance}
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
                                {member.token_balance ?? 0}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                ≈ ₦{((member.token_balance || 0) * 500).toLocaleString()} value
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