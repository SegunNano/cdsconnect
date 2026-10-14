import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    // Synchronously read token so protected routes don't bounce early
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')

        if (!storedToken) {
            setLoading(false)
            return
        }

        // Fetch latest profile state directly from PostgreSQL via Express API
        api.get('/members/me')
            .then(res => {
                const freshMember = res.data.data || res.data
                setMember(freshMember)

                // Maintain hardware-bound WebAuthn credential ID
                if (freshMember?.credential_id) {
                    localStorage.setItem('cds_credential_id', freshMember.credential_id)
                }
            })
            .catch(err => {
                console.error('Failed to restore session:', err)
                // Token was revoked (token_version mismatch) or expired
                localStorage.removeItem('token')
                setToken(null)
                setMember(null)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const completeOnboarding = (updatedMemberData) => {
        setMember(updatedMemberData)
        if (updatedMemberData?.credential_id) {
            localStorage.setItem('cds_credential_id', updatedMemberData.credential_id)
        }
    }

    const login = (memberData, tokenData) => {
        setMember(memberData)
        setToken(tokenData)
        
        // Store ONLY token in localStorage
        localStorage.setItem('token', tokenData)

        if (memberData?.credential_id) {
            localStorage.setItem('cds_credential_id', memberData.credential_id)
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (err) {
            console.error('Logout failed:', err)
        }
        setMember(null)
        setToken(null)
        
        // Remove token only — keep device passkey binding intact
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)