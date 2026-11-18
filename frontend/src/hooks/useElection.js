import { useState, useEffect, useCallback } from 'react'
import { getElection } from '../services/election.service'

// state: undefined = loading, null = nothing to show
export default function useElection() {
    const [state, setState] = useState(undefined)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        try {
            const res = await getElection()
            setState(res)
            setError('')
        } catch (err) {
            console.error('getElection error:', err)
            setError(err.response?.data?.message || 'Could not load the election.')
            setState(prev => (prev === undefined ? null : prev))
        }
    }, [])

    useEffect(() => { load() }, [load])
    return { state, error, reload: load }
}