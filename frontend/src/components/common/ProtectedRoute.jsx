import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import MemberLayout from './MemberLayout'

export default function ProtectedRoute({ children }) {
    const { member, loading } = useAuth()

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

    // Coordinator goes straight to their page — no MemberLayout
    if (member.member_type === 'staff') return children

    return <MemberLayout>{children}</MemberLayout>
}