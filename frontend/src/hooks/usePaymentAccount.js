import { useState, useEffect } from 'react'
import { getPaymentAccount } from '../services/paymentAccount.service'

// undefined = loading, null = none set or failed. Refetches whenever refetchKey changes.
export default function usePaymentAccount(refetchKey) {
    const [account, setAccount] = useState(undefined)

    useEffect(() => {
        let alive = true
        getPaymentAccount()
            .then(res => alive && setAccount(res?.data || null))
            .catch(() => alive && setAccount(null))
        return () => { alive = false }
    }, [refetchKey])

    return account
}