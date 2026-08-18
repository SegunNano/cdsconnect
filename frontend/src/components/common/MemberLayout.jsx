import { useAuth } from '../../context/AuthContext'
import BottomNav from './BottomNav'

export default function MemberLayout({ children }) {
    const { member } = useAuth()

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '90px',
            position: 'relative'
        }}>
            {children}
            <BottomNav member={member} />
        </div>
    )
}