import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    // 1. Lazy-initialize token so it exists immediately on first render
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')

        if (!storedToken) {
            setLoading(false)
            return
        }

        // Validate session with server on initial mount/refresh
        api.get('/members/me')
            .then(res => {
                // Support both unwrapped response.data or nested response.data.data
                const memberData = res.data?.data || res.data || res
                setMember(memberData)
            })
            .catch((err) => {
                console.error('Session restoration failed:', err.response?.data || err.message)
                // Only wipe token if server explicitly rejects it with a 401
                if (err.response?.status === 401) {
                    localStorage.removeItem('token')
                    setToken(null)
                    setMember(null)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const login = (memberData, tokenData) => {
        // 1. Synchronously write token to localStorage FIRST
        localStorage.setItem('token', tokenData)

        if (memberData?.credential_id) {
            localStorage.setItem('cds_credential_id', memberData.credential_id)
        }

        // 2. Update React state SECOND
        setToken(tokenData)
        setMember(memberData)
    }

    const completeOnboarding = (updatedMemberData) => {
        setMember(updatedMemberData)
        if (updatedMemberData?.credential_id) {
            localStorage.setItem('cds_credential_id', updatedMemberData.credential_id)
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            setMember(null)
            setToken(null)
            // Remove auth token — preserve cds_credential_id for passkey logins
            localStorage.removeItem('token')
        }
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)