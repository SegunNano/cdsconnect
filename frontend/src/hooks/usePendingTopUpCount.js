import { useState, useEffect, useCallback } from 'react'
import { getPendingTopUpCount } from '../services/tokens.service'

// Pass enabled=false for people who aren't reviewers so no request is made
export default function usePendingTopUpCount(enabled = true) {
    const [count, setCount] = useState(0)

    const refresh = useCallback(async () => {
        if (!enabled) return
        try {
            const res = await getPendingTopUpCount()
            setCount(Number(res?.data) || 0)
        } catch { /* badge is optional, ignore failures */ }
    }, [enabled])

    useEffect(() => {
        refresh()
        if (!enabled) return
        const timer = setInterval(refresh, 60 * 1000)
        return () => clearInterval(timer)
    }, [refresh, enabled])

    return { count, refresh }
}