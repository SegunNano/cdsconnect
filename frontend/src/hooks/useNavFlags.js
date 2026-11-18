import { useState, useEffect } from 'react'
import api from '../services/api'
import { getElectionStatus } from '../services/election.service'
import { ROUTE_ROLES } from '../constants'

const TTL = 60 * 1000
const cache = {}
const NO_ELECTION = { visible: false, status: null }

// Accept either the payload itself or the { success, data } wrapper
const unwrap = (res) =>
    res && typeof res === 'object' && 'success' in res && 'data' in res ? res.data : res

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
    const [flags, setFlags] = useState({ election: NO_ELECTION, signOutToday: false, certs: false })

    useEffect(() => {
        if (!id) return
        let alive = true
        const apply = (patch) => alive && setFlags(f => ({ ...f, ...patch }))

        if (isCorps) {
            cached(`${id}:election`, async () => unwrap(await getElectionStatus()))
                .then(v => apply({
                    election: v && typeof v === 'object' ? { ...NO_ELECTION, ...v } : NO_ELECTION
                }))
                .catch(() => {})
        }
        if (ROUTE_ROLES.signout.includes(role)) {
            cached(`${id}:signout`, async () => Boolean(unwrap((await api.get('/signout/today')).data)))
                .then(v => apply({ signOutToday: v })).catch(() => {})
        }
        if (ROUTE_ROLES.certificates.includes(role)) {
            cached(`${id}:certs`, async () => Boolean(unwrap((await api.get('/certificates/collate-status')).data)?.show_tab))
                .then(v => apply({ certs: v })).catch(() => {})
        }
        return () => { alive = false }
    }, [id, role, isCorps, pathname])

    return flags
}