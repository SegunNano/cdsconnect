import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // On initial app load, re-authenticate session using stored token
    useEffect(() => {
        const storedToken = localStorage.getItem('token')

        if (!storedToken) {
            setLoading(false)
            return
        }

        setToken(storedToken)

        // Fetch fresh member data from server on app load
        api.get('/members/me')
            .then(res => {
                const memberData = res.data.data || res.data
                setMember(memberData)

                // Preserve passkey credential binding on device
                if (memberData?.credential_id) {
                    localStorage.setItem('cds_credential_id', memberData.credential_id)
                }
            })
            .catch(err => {
                console.error('Session validation failed:', err)
                // Token is invalid, revoked (token_version mismatch), or expired
                localStorage.removeItem('token')
                setToken(null)
                setMember(null)
            })
            .finally(() => setLoading(false))
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
        
        // Store ONLY the token in localStorage
        localStorage.setItem('token', tokenData)

        if (memberData?.credential_id) {
            localStorage.setItem('cds_credential_id', memberData.credential_id)
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (err) {
            console.error('Logout error:', err)
        }
        setMember(null)
        setToken(null)
        
        // Remove token only — keep cds_credential_id intact for WebAuthn binding
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)