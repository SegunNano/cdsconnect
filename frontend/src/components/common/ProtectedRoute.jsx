import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { member, loading } = useAuth()

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

    if (!member) return <Navigate to="/login" replace />

    return children
}