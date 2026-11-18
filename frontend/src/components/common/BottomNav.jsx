import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, Calendar, FileText, User, Coins, LogOut,
    Settings2, DollarSign, Award, Vote
} from 'lucide-react'
import usePendingTopUpCount from '../../hooks/usePendingTopUpCount'
import useNavFlags from '../../hooks/useNavFlags'
import { ROUTE_ROLES } from '../../constants'

// Defined outside the component so they aren't rebuilt on every render
const Dot = () => (
    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#e53e3e', borderRadius: '50%' }} />
)

const Item = ({ icon: Icon, label, active, dot, basis, innerRef, onClick }) => (
    <div
        ref={innerRef} onClick={onClick}
        style={{ flex: `0 0 ${basis}`, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
    >
        <div style={{
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? '#e6f4ee' : 'transparent', borderRadius: '8px', position: 'relative'
        }}>
            <Icon size={18} color={active ? '#008751' : '#8fa396'} />
            {dot && <Dot />}
        </div>
        <div style={{
            fontSize: '0.58rem', fontWeight: 600, whiteSpace: 'nowrap',
            color: active ? '#008751' : '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
            {label}
        </div>
    </div>
)

const Fade = ({ side }) => (
    <div style={{
        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '24px', pointerEvents: 'none',
        background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, #ffffff, rgba(255,255,255,0))`
    }} />
)

export default function BottomNav({ member }) {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const role = member?.role
    const flags = useNavFlags(member, pathname)
    const { count: pendingTopUps } = usePendingTopUpCount(ROUTE_ROLES.topup.includes(role))

    const scroller = useRef(null)
    const itemRefs = useRef({})
    const firstRun = useRef(true)
    const [edges, setEdges] = useState({ left: false, right: false })

    // The "needed right now" tabs come first, so they're visible without scrolling
    const tabs = [
        { path: '/home', label: 'Home', icon: Home },
        ...(flags.election?.visible
            ? [{ path: '/election', label: 'Election', icon: Vote, dot: flags.election.status === 'voting' }] : []),
        ...(flags.signOutToday ? [{ path: '/signout', label: 'Sign Out', icon: LogOut }] : []),
        { path: '/attendance', label: 'Record', icon: Calendar },
        { path: '/clearance', label: 'Clearance', icon: FileText },
        { path: '/profile', label: 'Profile', icon: User },
        ...(ROUTE_ROLES.topup.includes(role)
            ? [{ path: '/topup', label: 'Top Up', icon: Coins, dot: pendingTopUps > 0 }] : []),
        ...(ROUTE_ROLES.treasury.includes(role)
            ? [{ path: '/treasury', label: 'Treasury', icon: DollarSign }] : []),
        ...(flags.certs ? [{ path: '/certificates/collate', label: 'Certs', icon: Award }] : []),
        ...(member?.is_dev ? [{ path: '/dev', label: 'Dev', icon: Settings2 }] : [])
    ]

    // Up to 5 tabs share the width. More than 5 slide, with the next one peeking in.
    const basis = tabs.length <= 5 ? `${100 / tabs.length}%` : '18%'

    const updateEdges = () => {
        const box = scroller.current
        if (!box) return
        setEdges({
            left: box.scrollLeft > 4,
            right: box.scrollWidth - box.clientWidth - box.scrollLeft > 4
        })
    }

    // Bring the active tab to the middle
    useEffect(() => {
        const box = scroller.current
        const el = itemRefs.current[pathname]
        if (box && el) {
            box.scrollTo({
                left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2,
                behavior: firstRun.current ? 'auto' : 'smooth'
            })
        }
        firstRun.current = false
        updateEdges()
    }, [pathname, tabs.length])

    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '390px', background: '#ffffff', borderTop: '1px solid #e8ece9',
            zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
        }}>
            <style>{`.nav-scroll{scrollbar-width:none;-ms-overflow-style:none}.nav-scroll::-webkit-scrollbar{display:none}`}</style>

            <div
                ref={scroller} className="nav-scroll" onScroll={updateEdges}
                style={{
                    display: 'flex', overflowX: 'auto', position: 'relative',
                    overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch',
                    padding: '10px 0 24px'
                }}
            >
                {tabs.map(t => (
                    <Item
                        key={t.path} icon={t.icon} label={t.label} dot={t.dot} basis={basis}
                        active={pathname === t.path}
                        innerRef={el => { itemRefs.current[t.path] = el }}
                        onClick={() => navigate(t.path)}
                    />
                ))}
            </div>

            {edges.left && <Fade side="left" />}
            {edges.right && <Fade side="right" />}
        </nav>
    )
}