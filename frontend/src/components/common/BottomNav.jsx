import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, Calendar, FileText, User,
    Coins, LogOut, Settings2, DollarSign, Award
} from 'lucide-react'
import api from '../../services/api'


import usePendingTopUpCount from '../../hooks/usePendingTopUpCount'
import { DIRECT_TOPUP_ROLES, TREASURY_ROLES } from '../../constants'



export default function BottomNav({ member }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [showCertsTab, setShowCertsTab] = useState(false)

    useEffect(() => {
        if (member?.role === 'general_secretary') {
            api.get('/certificates/collate-status')
                .then(res => setShowCertsTab(res.data.data.show_tab))
                .catch(() => {})
        }
    }, [member])

    const { count: pendingTopUps } = usePendingTopUpCount(DIRECT_TOPUP_ROLES.includes(member?.role))

    const tabs = [
        { path: '/home', label: 'Home', icon: Home },
        { path: '/attendance', label: 'Record', icon: Calendar },
        { path: '/clearance', label: 'Clearance', icon: FileText },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/topup', label: 'Top Up', icon: Coins, dot: pendingTopUps > 0 },
        ...(member?.role === 'president' || member?.role === 'vice_president'
            ? [{ path: '/signout', label: 'Sign Out', icon: LogOut }]
            : []),
        ...(TREASURY_ROLES.includes(member?.role)
            ? [{ path: '/treasury', label: 'Treasury', icon: DollarSign }]
            : []),
        ...(showCertsTab
            ? [{ path: '/certificates/collate', label: 'Certs', icon: Award }]
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
                            borderRadius: '8px',
                            position: 'relative'
                        }}>
                            {tab.dot && (
                                 <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#e53e3e', borderRadius: '50%' }} />
                            )}
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