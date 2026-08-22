import { Wallet, FilePlus, KeyRound, ClipboardList } from 'lucide-react'

export function QuickActionsGrid({ onNavigate }) {
    const quickActions = [
        { icon: <FilePlus size={18} color="#e53e3e" />, label: 'File Excuse', bg: '#fff0f0', path: '/excuse' },
        { icon: <KeyRound size={18} color="#d4900a" />, label: 'Reset PIN', bg: '#fff8e6', path: '/reset-pin' },
        { icon: <ClipboardList size={18} color="#4f46e5" />, label: 'My Record', bg: '#eef2ff', path: '/attendance' },
        { icon: <Wallet size={18} color="#008751" />, label: 'Transactions', bg: '#e6f4ee', path: '/tokens' }
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                {quickActions.map((action) => (
                    <div
                        key={action.label}
                        onClick={() => onNavigate(action.path)}
                        style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '12px 6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: action.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {action.icon}
                        </div>
                        <div style={{
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: '#4a5e52',
                            textAlign: 'center',
                            lineHeight: 1.3
                        }}>
                            {action.label}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}