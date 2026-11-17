import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, Calendar, FileText, User, Coins, LogOut,
    Settings2, DollarSign, Award, Vote, MoreHorizontal
} from 'lucide-react'
import api from '../../services/api'
import usePendingTopUpCount from '../../hooks/usePendingTopUpCount'
import { getElectionStatus } from '../../services/election.service'
import { ROUTE_ROLES } from '../../constants'

const MAX_TABS = 4      // more than this: show 5 and put the rest behind "More"

export default function BottomNav({ member }) {
    const navigate = useNavigate()
    const location = useLocation()
    const role = member?.role
    const isCorps = member?.member_type === 'corps_member'

    const [showCerts, setShowCerts] = useState(false)
    const [election, setElection] = useState({ visible: false, status: null })
    const [moreOpen, setMoreOpen] = useState(false)
    const { count: pendingTopUps } = usePendingTopUpCount(ROUTE_ROLES.topup.includes(role))

    useEffect(() => {
        if (role !== 'secretary') return
        api.get('/certificates/collate-status')
            .then(res => setShowCerts(res.data.data.show_tab))
            .catch(() => {})
    }, [role])

    // Cheap check on every navigation, so the tab appears and disappears with the election
    useEffect(() => {
        if (!isCorps) return
        getElectionStatus().then(setElection).catch(() => {})
    }, [isCorps, location.pathname])

    const tabs = [
        { path: '/home', label: 'Home', icon: Home },
        ...(election.visible ? [{ path: '/election', label: 'Election', icon: Vote, dot: election.status === 'voting' }] : []),
        { path: '/attendance', label: 'Record', icon: Calendar },
        { path: '/clearance', label: 'Clearance', icon: FileText },
        { path: '/profile', label: 'Profile', icon: User },
        ...(ROUTE_ROLES.topup.includes(role) ? [{ path: '/topup', label: 'Top Up', icon: Coins, dot: pendingTopUps > 0 }] : []),
        ...(ROUTE_ROLES.signout.includes(role) ? [{ path: '/signout', label: 'Sign Out', icon: LogOut }] : []),
        ...(ROUTE_ROLES.treasury.includes(role) ? [{ path: '/treasury', label: 'Treasury', icon: DollarSign }] : []),
        ...(showCerts ? [{ path: '/certificates/collate', label: 'Certs', icon: Award }] : []),
        ...(member?.is_dev ? [{ path: '/dev', label: 'Dev', icon: Settings2 }] : [])
    ]

    const needsMore = tabs.length > MAX_TABS
    const shown = needsMore ? tabs.slice(0, MAX_TABS - 1) : tabs
    const hidden = needsMore ? tabs.slice(MAX_TABS - 1) : []
    const moreActive = hidden.some(t => t.path === location.pathname)
    const moreDot = hidden.some(t => t.dot)

    const Dot = () => (
        <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#e53e3e', borderRadius: '50%' }} />
    )

    const Item = ({ icon: Icon, label, active, dot, onClick }) => (
        <div onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <div style={{
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#e6f4ee' : 'transparent', borderRadius: '8px', position: 'relative'
            }}>
                <Icon size={18} color={active ? '#008751' : '#8fa396'} />
                {dot && <Dot />}
            </div>
            <div style={{ fontSize: '0.58rem', fontWeight: 600, color: active ? '#008751' : '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </div>
        </div>
    )

    return (
        <>
            <nav style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: '390px', background: '#ffffff', borderTop: '1px solid #e8ece9',
                display: 'flex', padding: '10px 0 24px', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
            }}>
                {shown.map(t => (
                    <Item key={t.path} icon={t.icon} label={t.label} dot={t.dot}
                        active={location.pathname === t.path} onClick={() => navigate(t.path)} />
                ))}
                {needsMore && (
                    <Item icon={MoreHorizontal} label="More" dot={moreDot} active={moreActive} onClick={() => setMoreOpen(true)} />
                )}
            </nav>

            {moreOpen && (
                <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150 }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                            width: '100%', maxWidth: '390px', background: '#ffffff',
                            borderRadius: '20px 20px 0 0', padding: '16px 16px 28px'
                        }}
                    >
                        {hidden.map(t => {
                            const Icon = t.icon
                            return (
                                <div
                                    key={t.path}
                                    onClick={() => { setMoreOpen(false); navigate(t.path) }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 8px', borderBottom: '1px solid #f2f4f7', cursor: 'pointer' }}
                                >
                                    <div style={{ position: 'relative', display: 'flex' }}>
                                        <Icon size={20} color="#008751" />
                                        {t.dot && <Dot />}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0d1b12' }}>{t.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}