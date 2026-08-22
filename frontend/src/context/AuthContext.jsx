import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedMember = localStorage.getItem('member')
        const storedToken = localStorage.getItem('token')

        if (storedMember && storedToken) {
            setMember(JSON.parse(storedMember))
            setToken(storedToken)
        }
        setLoading(false)
    }, [])

    const completeOnboarding = (updatedMemberData) => {
        localStorage.setItem('member', JSON.stringify(updatedMemberData))
        setMember(updatedMemberData)
    }

    const login = (memberData, tokenData) => {
        setMember(memberData)
        setToken(tokenData)
        localStorage.setItem('member', JSON.stringify(memberData))
        localStorage.setItem('token', tokenData)

        // Persist credential_id across logouts if returned by the backend
        if (memberData?.credential_id) {
            localStorage.setItem('cds_credential_id', memberData.credential_id)
        }
    }

    const logout = () => {
        setMember(null)
        setToken(null)
        localStorage.removeItem('member')
        localStorage.removeItem('token')
        // NOTE: We deliberately DO NOT remove 'cds_credential_id' so device binding stays intact
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)