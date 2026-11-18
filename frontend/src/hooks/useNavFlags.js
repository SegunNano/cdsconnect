import { useState, useEffect } from 'react'
import api from '../services/api'
import { getElectionStatus } from '../services/election.service'
import { ROUTE_ROLES } from '../constants'

const TTL = 60 * 1000
const cache = {}

// Cached per member for a minute. The key includes the member id, so someone
// signing in on the same device never inherits another person's flags.
const cached = async (key, fetcher) => {
    const hit = cache[key]
    if (hit && Date.now() - hit.at < TTL) return hit.value
    const value = await fetcher()
    cache[key] = { at: Date.now(), value }
    return value
}

export default function useNavFlags(member, pathname) {
    const id = member?.id
    const role = member?.role
    const isCorps = member?.member_type === 'corps_member'
    const [flags, setFlags] = useState({
        election: { visible: false, status: null },
        signOutToday: false,
        certs: false
    })

    useEffect(() => {
        if (!id) return
        let alive = true
        const apply = (patch) => alive && setFlags(f => ({ ...f, ...patch }))

        if (isCorps) {
            cached(`${id}:election`, getElectionStatus)
                .then(v => apply({ election: v })).catch(() => {})
        }
        if (ROUTE_ROLES.signout.includes(role)) {
            cached(`${id}:signout`, async () => Boolean((await api.get('/signout/today')).data?.data))
                .then(v => apply({ signOutToday: v })).catch(() => {})
        }
        if (ROUTE_ROLES.certificates.includes(role)) {
            cached(`${id}:certs`, async () => Boolean((await api.get('/certificates/collate-status')).data?.data?.show_tab))
                .then(v => apply({ certs: v })).catch(() => {})
        }
        return () => { alive = false }
    }, [id, role, isCorps, pathname])

    return flags
}