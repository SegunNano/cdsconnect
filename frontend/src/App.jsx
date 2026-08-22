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
import SignOutPanel from './pages/member/SignOutPanel'
import TopUp from './pages/treasurer/TopUp'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import DevDashboard from './pages/dev/DevDashboard'
import VerifySlip from './pages/public/VerifySlip'
import Onboarding from './pages/auth/Onboarding'
import TokenHistory from './pages/member/TokenHistory'

function HomeRedirect() {
    const { member, loading } = useAuth()
    if (loading) return null
    if (!member) return <Navigate to="/login" replace />
    if (member.member_type === 'staff') return <Navigate to="/coordinator" replace />
    return <Navigate to="/home" replace />
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/onboarding" element={<Onboarding />} />

                    {/* Root redirect */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Member */}
                    <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
                    <Route path="/reset-pin" element={<ProtectedRoute><ResetPin /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/excuse" element={<ProtectedRoute><ExcuseForm /></ProtectedRoute>} />
                    <Route path="/clearance" element={<ProtectedRoute><ClearanceSlip /></ProtectedRoute>} />
                    <Route path="/clearance/:meetingId" element={<ProtectedRoute><ClearanceSlip /></ProtectedRoute>} />
                    <Route path="/signout" element={<ProtectedRoute><SignOutPanel /></ProtectedRoute>} />
                    <Route path="/topup" element={<ProtectedRoute><TopUp /></ProtectedRoute>} />
                    <Route path="/dev" element={<ProtectedRoute><DevDashboard /></ProtectedRoute>} />
                    <Route path="/tokens" element={<ProtectedRoute><TokenHistory /></ProtectedRoute>} />
                    <Route path="/verify/:qrToken" element={<VerifySlip />} />

                    {/* Coordinator */}
                    <Route path="/coordinator" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}