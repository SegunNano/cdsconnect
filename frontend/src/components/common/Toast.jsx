import { useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [message])

    if (!message) return null

    const isSuccess = type === 'success'

    return (
        <>
            {/* Backdrop — tap to dismiss */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2999,
                    background: 'transparent'
                }}
            />
            <div style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3000,
                background: isSuccess ? '#008751' : '#e53e3e',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '12px 22px',
                borderRadius: '50px',
                boxShadow: isSuccess
                    ? '0 8px 24px rgba(0,135,81,0.3)'
                    : '0 8px 24px rgba(229,62,62,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                whiteSpace: 'nowrap',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                animation: 'slideDown 0.25s ease',
                maxWidth: '320px'
            }}>
                <style>{`
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                `}</style>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                }}>
                    {isSuccess
                        ? <CheckCircle size={13} color="white" />
                        : <XCircle size={13} color="white" />
                    }
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {message}
                </span>
            </div>
        </>
    )
}