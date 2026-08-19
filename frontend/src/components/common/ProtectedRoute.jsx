import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MemberLayout from './MemberLayout'

const NO_LAYOUT_PATHS = ['/dev', '/coordinator']

export default function ProtectedRoute({ children }) {
    const { member, loading } = useAuth()
    const location = useLocation()

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#8fa396',
            fontSize: '0.88rem'
        }}>
            Loading...
        </div>
    )

    if (!member) return <Navigate to="/login" replace />

    // Staff and pages with their own layout skip MemberLayout
    if (member.member_type === 'staff' || NO_LAYOUT_PATHS.includes(location.pathname)) {
        return children
    }

    return <MemberLayout>{children}</MemberLayout>
}