import { useState, useEffect } from 'react'
import { X, Bell, CheckCheck } from 'lucide-react'
import api from '../../services/api'

export default function NotificationsModal({ isOpen, onClose, onRead }) {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isOpen) return
        const fetch = async () => {
            setLoading(true)
            try {
                const result = await api.get('/notifications')
                setNotifications(result.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [isOpen])

    const handleMarkAll = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            onRead(0)
        } catch (err) {
            console.error(err)
        }
    }

    const handleMarkOne = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            const unread = notifications.filter(n => !n.is_read && n.id !== id).length
            onRead(unread)
        } catch (err) {
            console.error(err)
        }
    }

    const getTypeColor = (type) => {
        const colors = {
            excuse_approved: '#008751',
            excuse_rejected: '#e53e3e',
            excuse_submitted: '#d4900a',
            topup: '#008751',
            meeting_created: '#4f46e5',
            low_token: '#d4900a',
            clearance_ready: '#008751'
        }
        return colors[type] || '#8fa396'
    }

    const getTypeBg = (type) => {
        const bgs = {
            excuse_approved: '#e6f4ee',
            excuse_rejected: '#fff0f0',
            excuse_submitted: '#fff8e6',
            topup: '#e6f4ee',
            meeting_created: '#eef2ff',
            low_token: '#fff8e6',
            clearance_ready: '#e6f4ee'
        }
        return bgs[type] || '#f2f4f7'
    }

    if (!isOpen) return null

    return (
        <>
            {/* BACKDROP */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    zIndex: 200,
                    backdropFilter: 'blur(2px)'
                }}
            />

            {/* BOTTOM SHEET */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '390px',
                background: '#ffffff',
                borderRadius: '24px 24px 0 0',
                zIndex: 201,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.25s ease'
            }}>
                <style>{`
                    @keyframes slideUp {
                        from { transform: translateX(-50%) translateY(100%); }
                        to { transform: translateX(-50%) translateY(0); }
                    }
                `}</style>

                {/* HANDLE */}
                <div style={{
                    width: '40px',
                    height: '4px',
                    background: '#e8ece9',
                    borderRadius: '2px',
                    margin: '12px auto 0'
                }} />

                {/* HEADER */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px 12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={18} color="#0d1b12" />
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                            Notifications
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {notifications.some(n => !n.is_read) && (
                            <div
                                onClick={handleMarkAll}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#008751',
                                    cursor: 'pointer'
                                }}
                            >
                                <CheckCheck size={14} color="#008751" />
                                Mark all read
                            </div>
                        )}
                        <div
                            onClick={onClose}
                            style={{
                                width: '32px',
                                height: '32px',
                                background: '#f2f4f7',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={16} color="#4a5e52" />
                        </div>
                    </div>
                </div>

                {/* LIST */}
                <div style={{ overflowY: 'auto', padding: '0 20px 32px', flex: 1 }}>

                    {loading && (
                        <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                            Loading...
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Bell size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                                No notifications yet
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                                You'll see updates here
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.is_read && handleMarkOne(notif.id)}
                                style={{
                                    background: notif.is_read ? '#ffffff' : '#f8fdf9',
                                    borderRadius: '14px',
                                    padding: '14px',
                                    border: notif.is_read ? '1px solid #f2f4f7' : '1px solid #c2e0cf',
                                    display: 'flex',
                                    gap: '12px',
                                    cursor: notif.is_read ? 'default' : 'pointer'
                                }}
                            >
                                {/* TYPE DOT */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: getTypeBg(notif.type),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: getTypeColor(notif.type)
                                    }} />
                                </div>

                                {/* CONTENT */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.82rem',
                                        fontWeight: notif.is_read ? 500 : 700,
                                        color: '#0d1b12',
                                        marginBottom: '3px'
                                    }}>
                                        {notif.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#4a5e52',
                                        lineHeight: 1.5,
                                        marginBottom: '4px'
                                    }}>
                                        {notif.message}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#8fa396' }}>
                                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* UNREAD DOT */}
                                {!notif.is_read && (
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#008751',
                                        flexShrink: 0,
                                        marginTop: '4px'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}