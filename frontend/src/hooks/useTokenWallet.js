import { useState, useEffect, useCallback } from 'react'
import { getMyTokenHistory, getMyTopUpRequests } from '../services/tokens.service'
import { useAuth } from '../context/AuthContext'

const toArray = (result) => {
    const list = Array.isArray(result)
        ? result
        : (result?.data?.history || result?.history || result?.data || [])
    return Array.isArray(list) ? list : []
}

export default function useTokenWallet() {
    const { refreshMember } = useAuth()
    const [history, setHistory] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const [h, r] = await Promise.allSettled([getMyTokenHistory(), getMyTopUpRequests()])
        if (h.status === 'fulfilled') setHistory(toArray(h.value))
        if (r.status === 'fulfilled') setRequests(toArray(r.value))
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    // After any change: refetch the lists and the balance in the header context
    const reload = useCallback(
        () => Promise.all([load(), refreshMember?.()]),
        [load, refreshMember]
    )

    return { history, requests, loading, reload }
}