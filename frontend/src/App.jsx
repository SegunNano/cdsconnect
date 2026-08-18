import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/member/Dashboard'
import AttendanceHistory from './pages/member/AttendanceHistory'
import ResetPin from './pages/member/ResetPin'
import Profile from './pages/member/Profile'
import ExcuseForm from './pages/member/ExcuseForm'
import ClearanceSlip from './pages/member/ClearanceSlip'
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

                    {/* Member routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
                    <Route path="/reset-pin" element={<ProtectedRoute><ResetPin /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/excuse" element={<ProtectedRoute><ExcuseForm /></ProtectedRoute>} />
                    <Route path="/clearance" element={<ProtectedRoute><ClearanceSlip /></ProtectedRoute>} />
                    <Route path="/clearance/:meetingId" element={<ProtectedRoute><ClearanceSlip /></ProtectedRoute>} />

                    {/* Coordinator */}
                    <Route path="/coordinator" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />

                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}