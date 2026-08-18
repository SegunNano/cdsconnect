import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, Calendar, FileText, User,
    Coins, LogOut, Settings2
} from 'lucide-react'

export default function BottomNav({ member }) {
    const navigate = useNavigate()
    const location = useLocation()

    const tabs = [
        { path: '/home', label: 'Home', icon: Home },
        { path: '/attendance', label: 'Record', icon: Calendar },
        { path: '/clearance', label: 'Clearance', icon: FileText },
        { path: '/profile', label: 'Profile', icon: User },
        ...(member?.role === 'treasurer' || member?.role === 'financial_secretary'
            ? [{ path: '/topup', label: 'Top Up', icon: Coins }]
            : []),
        ...(member?.role === 'president' || member?.role === 'vice_president'
            ? [{ path: '/signout', label: 'Sign Out', icon: LogOut }]
            : []),
        ...(member?.is_dev
            ? [{ path: '/dev', label: 'Dev', icon: Settings2 }]
            : [])
    ]

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '390px',
            background: '#ffffff',
            borderTop: '1px solid #e8ece9',
            display: 'flex',
            padding: '10px 0 24px',
            zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
        }}>
            {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = location.pathname === tab.path
                return (
                    <div
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isActive ? '#e6f4ee' : 'transparent',
                            borderRadius: '8px'
                        }}>
                            <Icon size={18} color={isActive ? '#008751' : '#8fa396'} />
                        </div>
                        <div style={{
                            fontSize: '0.58rem',
                            fontWeight: 600,
                            color: isActive ? '#008751' : '#8fa396',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {tab.label}
                        </div>
                    </div>
                )
            })}
        </nav>
    )
}