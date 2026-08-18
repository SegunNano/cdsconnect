import { Bell } from 'lucide-react'
import NotificationsModal from '../common/NotificationsModal'

export function UserTopBar({ 
    firstName, 
    initials, 
    unreadCount, 
    showNotifications, 
    setShowNotifications, 
    setUnreadCount 
}) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '52px 20px 16px',
            background: '#ffffff'
        }}>
            <div>
                <div style={{ fontSize: '0.78rem', color: '#8fa396', fontWeight: 400, marginBottom: '2px' }}>
                    {today}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12' }}>
                    Hey, <span style={{ color: '#008751' }}>{firstName}</span> 👋
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                    onClick={() => setShowNotifications(true)}
                    style={{
                        position: 'relative',
                        width: '40px',
                        height: '40px',
                        background: '#f2f4f7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Bell size={20} color="#4a5e52" />
                    {unreadCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: '#e53e3e',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }} />
                    )}
                </div>

                <NotificationsModal
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    onRead={(count) => setUnreadCount(count)}
                />

                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e6f4ee',
                    border: '2px solid #c2e0cf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: '#008751'
                }}>
                    {initials}
                </div>
            </div>
        </div>
    )
}