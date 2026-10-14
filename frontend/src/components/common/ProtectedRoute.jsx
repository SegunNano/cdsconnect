import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MemberLayout from './MemberLayout'

const NO_LAYOUT_PATHS = ['/dev', '/coordinator']

export default function ProtectedRoute({ children, requireDev = false }) {
    const { member, loading } = useAuth()
    const location = useLocation()

    if (loading) return <div>Loading...</div>
    if (!member) return <Navigate to="/login" replace />

    // Dev route guard
    if (requireDev && !member.is_dev) {
        return <Navigate to="/" replace />
    }

    // Coordinator route guard
    if (location.pathname === '/coordinator' && member.member_type !== 'staff') {
        return <Navigate to="/" replace />
    }

    if (!member.credential_id && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />
    }

    if (member.member_type === 'staff' || NO_LAYOUT_PATHS.includes(location.pathname)) {
        return children
    }

    return <MemberLayout>{children}</MemberLayout>
}