import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount, check if token exists and fetch current member profile from API
    useEffect(() => {
        const storedToken = localStorage.getItem('token')

        if (storedToken) {
            setToken(storedToken)
            fetchProfile(storedToken)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchProfile = async (authToken) => {
        try {
            const response = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` }
            })
            const memberData = response.data.data || response.data
            setMember(memberData)

            // Keep passkey credential binding intact on phone/device
            if (memberData?.credential_id) {
                localStorage.setItem('cds_credential_id', memberData.credential_id)
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err)
            // If token is expired or invalid, purge session state
            setMember(null)
            setToken(null)
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const completeOnboarding = (updatedMemberData) => {
        setMember(updatedMemberData)
        if (updatedMemberData?.credential_id) {
            localStorage.setItem('cds_credential_id', updatedMemberData.credential_id)
        }
    }

    const login = (memberData, tokenData) => {
        setMember(memberData)
        setToken(tokenData)
        
        // Store only token in localStorage
        localStorage.setItem('token', tokenData)

        // Store passkey credential_id for hardware/device binding
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
        
        // Purge session token only
        localStorage.removeItem('token')

        // NOTE: 'cds_credential_id' is explicitly kept so hardware/device binding stays intact
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)