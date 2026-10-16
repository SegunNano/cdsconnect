import { Wallet, FilePlus } from 'lucide-react'

export function QuickActionsGrid({ onNavigate, meeting }) {
    const hasUpcomingMeeting = meeting?.state === 'upcoming'

    const quickActions = [
        ...(hasUpcomingMeeting ? [{ 
            icon: <FilePlus size={20} color="#e53e3e" />, 
            label: 'File Excuse', 
            bg: '#fff0f0', 
            path: '/excuse' 
        }] : []),
        { 
            icon: <Wallet size={20} color="#008751" />, 
            label: 'Transactions', 
            bg: '#e6f4ee', 
            path: '/tokens' 
        }
    ]

    return (
        <>
            <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#8fa396',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '10px'
            }}>
                Quick Actions
            </div>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${quickActions.length}, 1fr)`, 
                gap: '8px', 
                marginBottom: '14px' 
            }}>
                {quickActions.map((action) => (
                    <div
                        key={action.label}
                        onClick={() => onNavigate(action.path)}
                        style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '12px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: action.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {action.icon}
                        </div>
                        <div style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#0d1b12',
                            lineHeight: 1.2
                        }}>
                            {action.label}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}