import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/member/Dashboard'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'

function RootRedirect() {
    const { member } = useAuth()
    if (!member) return <Navigate to="/login" replace />
    if (member.member_type === 'staff') return <Navigate to="/coordinator" replace />
    return <Navigate to="/dashboard" replace />
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/coordinator" element={
                        <ProtectedRoute>
                            <CoordinatorDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}