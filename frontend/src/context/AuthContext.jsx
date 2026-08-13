import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [member, setMember] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

   useEffect(() => {
    try {
        const storedMember = localStorage.getItem('member')
        const storedToken = localStorage.getItem('token')

        if (storedMember && storedToken) {
            setMember(JSON.parse(storedMember))
            setToken(storedToken)
        }
    } catch (error) {
        console.error('Failed to restore authentication:', error)
        localStorage.removeItem('member')
        localStorage.removeItem('token')
    } finally {
        setLoading(false)
    }
}, [])

    const login = (memberData, tokenData) => {
        setMember(memberData)
        setToken(tokenData)
        localStorage.setItem('member', JSON.stringify(memberData))
        localStorage.setItem('token', tokenData)
    }

    const logout = () => {
        setMember(null)
        setToken(null)
        localStorage.removeItem('member')
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{ member, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)


// import { createContext, useContext, useState } from 'react'

// const AuthContext = createContext(null)

// const getStoredMember = () => {
//     try {
//         const storedMember = localStorage.getItem('member')
//         return storedMember ? JSON.parse(storedMember) : null
//     } catch {
//         localStorage.removeItem('member')
//         return null
//     }
// }

// const getStoredToken = () => {
//     return localStorage.getItem('token')
// }

// export const AuthProvider = ({ children }) => {
//     const [member, setMember] = useState(getStoredMember)
//     const [token, setToken] = useState(getStoredToken)

//     const login = (memberData, tokenData) => {
//         setMember(memberData)
//         setToken(tokenData)

//         localStorage.setItem('member', JSON.stringify(memberData))
//         localStorage.setItem('token', tokenData)
//     }

//     const logout = () => {
//         setMember(null)
//         setToken(null)

//         localStorage.removeItem('member')
//         localStorage.removeItem('token')
//     }

//     return (
//         <AuthContext.Provider
//             value={{
//                 member,
//                 token,
//                 login,
//                 logout
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     )
// }

// export const useAuth = () => {
//     const context = useContext(AuthContext)

//     if (!context) {
//         throw new Error(
//             'useAuth must be used within an AuthProvider'
//         )
//     }

//     return context
// }