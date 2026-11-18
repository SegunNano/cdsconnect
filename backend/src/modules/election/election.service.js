import crypto from 'crypto'
import pool from '../../config/db.js'
import supabase from '../../config/supabase.js'
import { withTransaction } from '../../utils/transaction.js'
import { verifyMemberPin } from '../../utils/verifyPin.js'
import { checkIfSuspended } from '../attendance/attendance.service.js'
import { createNotification } from '../notifications/notifications.service.js'
import { ELECTED_ROLES, NOTIFICATION_TYPES } from '../../constants.js'

const BUCKET = 'evidence'
const ALLOWED_PHOTO = ['image/jpeg', 'image/png', 'image/webp']
const label = (role) => role.replace(/_/g, ' ')

// ── NOTIFICATIONS ────────────────────────────────────────────────
const notifyMember = (id, title, message) =>
    createNotification(id, title, message, NOTIFICATION_TYPES.ELECTION)
        .catch(err => console.error('Notification error:', err))

const notifyAllMembers = async (title, message) => {
    const { rows } = await pool.query(
        "SELECT id FROM members WHERE is_active = true AND member_type = 'corps_member'")
    await Promise.all(rows.map(r => notifyMember(r.id, title, message)))
}

// ── PHOTOS (private bucket) ──────────────────────────────────────
const uploadPhoto = async (file) => {
    if (!file) throw { status: 400, message: 'A photo is required.' }
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(file.buffer)
    if (!type || !ALLOWED_PHOTO.includes(type.mime)) {
        throw { status: 400, message: 'The photo must be a JPG, PNG or WebP image.' }
    }
    const path = `${crypto.randomBytes(16).toString('hex')}.${type.ext}`
    const { error } = await supabase.storage.from(BUCKET)
        .upload(path, file.buffer, { contentType: type.mime })
    if (error) throw { status: 500, message: 'Could not upload the photo. Try again.' }
    return path
}

const removePhotos = async (paths) => {
    const list = paths.filter(Boolean)
    if (list.length === 0) return true
    const { error } = await supabase.storage.from(BUCKET).remove(list)
    if (error) {
        console.error('Election photo delete failed:', error.message)
        return false
    }
    return true
}

const signUrls = async (paths) => {
    const list = paths.filter(Boolean)
    if (list.length === 0) return {}
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(list, 3600)
    return Object.fromEntries((data || []).map(d => [d.path, d.signedUrl]))
}

const purgePhotos = async (electionId) => {
    const { rows } = await pool.query(
        'SELECT photo_path FROM election_candidates WHERE election_id = $1 AND photo_path IS NOT NULL',
        [electionId])
    if (rows.length === 0) return
    if (await removePhotos(rows.map(r => r.photo_path))) {
        await pool.query('UPDATE election_candidates SET photo_path = NULL WHERE election_id = $1', [electionId])
    }
}

export const purgeLeftoverPhotos = async () => {
    const { rows } = await pool.query(
        `SELECT c.id, c.photo_path
         FROM election_candidates c JOIN elections e ON e.id = c.election_id
         WHERE c.photo_path IS NOT NULL AND (e.status = 'closed' OR c.status <> 'active')`)
    if (rows.length === 0) return
    if (await removePhotos(rows.map(r => r.photo_path))) {
        await pool.query('UPDATE election_candidates SET photo_path = NULL WHERE id = ANY($1)', [rows.map(r => r.id)])
    }
}

// ── LOOKUPS ──────────────────────────────────────────────────────
const getOpenElection = async () => {
    const { rows } = await pool.query("SELECT * FROM elections WHERE status <> 'closed' LIMIT 1")
    return rows[0] || null
}

const getVisibleElection = async () => {
    const { rows } = await pool.query(
        `SELECT * FROM elections
         WHERE status IN ('applications', 'review', 'voting')
            OR (status = 'closed' AND closed_at::date = CURRENT_DATE)
         ORDER BY id DESC LIMIT 1`)
    return rows[0] || null
}

const getPositions = async (electionId) => {
    const { rows } = await pool.query(
        `SELECT ep.role, m.first_name AS holder_first, m.last_name AS holder_last
         FROM election_positions ep
         LEFT JOIN members m ON m.role = ep.role AND m.is_active = true
         WHERE ep.election_id = $1 ORDER BY ep.role`, [electionId])
    return rows
}

const getElectablePositions = async () => {
    const { rows } = await pool.query(
        `SELECT r.role, m.first_name AS holder_first, m.last_name AS holder_last
         FROM unnest($1::text[]) AS r(role)
         LEFT JOIN members m ON m.role = r.role AND m.is_active = true`, [ELECTED_ROLES])
    return rows
}

export const getLockedRoles = async () => {
    const { rows } = await pool.query(
        `SELECT ep.role FROM election_positions ep
         JOIN elections e ON e.id = ep.election_id WHERE e.status <> 'closed'`)
    return rows.map(r => r.role)
}

export const isActiveCandidate = async (memberId) => {
    const { rows } = await pool.query(
        `SELECT 1 FROM election_candidates c JOIN elections e ON e.id = c.election_id
         WHERE c.member_id = $1 AND c.status = 'active' AND e.status <> 'closed'`, [memberId])
    return rows.length > 0
}

// ── DEV: CREATE ──────────────────────────────────────────────────
export const createElection = async (devId, { title, roles, minMonthsLeft }) => {
    const name = String(title || '').trim()
    const picked = [...new Set(Array.isArray(roles) ? roles : [])].filter(r => ELECTED_ROLES.includes(r))
    const months = minMonthsLeft === undefined || minMonthsLeft === '' ? 3 : Number(minMonthsLeft)

    if (name.length < 3 || name.length > 100) throw { status: 400, message: 'Give the election a title of 3 to 100 characters.' }
    if (picked.length === 0) throw { status: 400, message: 'Pick at least one position.' }
    if (!Number.isInteger(months) || months < 0 || months > 12) throw { status: 400, message: 'Minimum remaining service must be 0 to 12 months.' }

    try {
        const election = await withTransaction(async (client) => {
            const { rows: [e] } = await client.query(
                `INSERT INTO elections (title, min_months_left, created_by) VALUES ($1, $2, $3) RETURNING *`,
                [name, months, devId])
            await client.query(
                'INSERT INTO election_positions (election_id, role) SELECT $1, unnest($2::text[])',
                [e.id, picked])
            return e
        })
        return election
    } catch (err) {
        if (err.code === '23505') throw { status: 409, message: 'An election is already in progress. Close it first.' }
        throw err
    }
}

// ── DEV: PHASES ──────────────────────────────────────────────────
const PHASES = {
    open_applications:  { from: ['setup'],        to: 'applications', stamp: 'applications_opened_at' },
    close_applications: { from: ['applications'], to: 'review',        stamp: 'applications_closed_at' },
    start_voting:       { from: ['review'],       to: 'voting',        stamp: 'voting_opened_at' },
    close_election:     { from: ['setup', 'applications', 'review', 'voting'], to: 'closed', stamp: 'closed_at' }
}
const NEEDS_PIN = ['start_voting', 'close_election']

const snapshotProfiles = (client, electionId) => client.query(
    `UPDATE election_candidates c
     SET profile = jsonb_build_object(
         'first_name', m.first_name, 'last_name', m.last_name,
         'state_code', m.state_code, 'gender', m.gender,
         'breakout_session', m.breakout_session,
         'stream', CASE WHEN s.id IS NULL THEN NULL
                        ELSE s.year::text || ' Batch ' || s.batch || ' Stream ' || s.stream::text END)
     FROM members m
     LEFT JOIN streams s ON s.id = m.stream_id
     WHERE c.member_id = m.id AND c.election_id = $1
       AND c.status = 'active' AND c.profile IS NULL`,
    [electionId])

export const transitionElection = async (devId, { action, pin }) => {
    const rule = PHASES[action]
    if (!rule) throw { status: 400, message: 'Unknown action.' }
    if (NEEDS_PIN.includes(action)) await verifyMemberPin(devId, pin)

    const election = await withTransaction(async (client) => {
        const { rows: [e] } = await client.query(
            "SELECT * FROM elections WHERE status <> 'closed' ORDER BY id DESC LIMIT 1 FOR UPDATE")
        if (!e) throw { status: 404, message: 'There is no active election.' }
        if (!rule.from.includes(e.status)) {
            throw { status: 409, message: `That step isn't available while the election is at the "${e.status}" stage.` }
        }

        if (action === 'close_applications' || action === 'close_election') {
            await snapshotProfiles(client, e.id)
        }

        if (action === 'start_voting') {
            const { rows: [c] } = await client.query(
                `SELECT COUNT(*)::int AS n FROM (
                    SELECT role FROM election_candidates
                    WHERE election_id = $1 AND status = 'active'
                    GROUP BY role HAVING COUNT(*) >= 2) x`, [e.id])
            if (c.n === 0) {
                throw { status: 409, message: 'No position has two or more candidates, so there is nothing to vote on. Close the election instead.' }
            }
            const { rows: [v] } = await client.query(
                "SELECT COUNT(*)::int AS n FROM members WHERE is_active = true AND member_type = 'corps_member'")
            await client.query('UPDATE elections SET eligible_voters = $1 WHERE id = $2', [v.n, e.id])
        }

        const { rows: [updated] } = await client.query(
            `UPDATE elections SET status = $1, ${rule.stamp} = NOW() WHERE id = $2 RETURNING *`,
            [rule.to, e.id])
        return updated
    })

    if (action === 'close_election') await purgePhotos(election.id)

    const positions = (await getPositions(election.id)).map(p => label(p.role)).join(', ')
    const notices = {
        open_applications:  ['Election: applications open', `Applications are open for ${positions}. Apply from the Election tab.`],
        close_applications: ['Election: applications closed', 'The candidates are listed. Voting opens soon.'],
        start_voting:       ['Election: voting is open', 'Cast your vote for each position from the Election tab.'],
        close_election:     election.voting_opened_at
            ? ['Election closed', 'The results are in. They stay visible today only.']
            : ['Election ended', 'The election was closed without a vote.']
    }
    await notifyAllMembers(...notices[action])

    return getAdminState()
}

// ── DEV: REMOVE A CANDIDATE ──────────────────────────────────────
export const removeCandidate = async (candidateId, reason) => {
    const why = String(reason || '').trim()
    if (why.length < 3) throw { status: 400, message: 'A reason is required. The member will see it.' }

    const e = await getOpenElection()
    if (!e || !['applications', 'review'].includes(e.status)) {
        throw { status: 409, message: 'Candidates can only be removed before voting starts.' }
    }

    const { rows } = await pool.query(
        `UPDATE election_candidates SET status = 'removed', removed_reason = $1
         WHERE id = $2 AND election_id = $3 AND status = 'active'
         RETURNING member_id, role, photo_path`,
        [why, candidateId, e.id])
    if (rows.length === 0) throw { status: 404, message: 'Application not found.' }

    if (await removePhotos([rows[0].photo_path])) {
        await pool.query('UPDATE election_candidates SET photo_path = NULL WHERE id = $1', [candidateId])
    }
    await notifyMember(rows[0].member_id, 'Election application removed',
        `Your application for ${label(rows[0].role)} was removed. Reason: ${why}`)

    return getAdminState()
}

// ── MEMBER: APPLY / EDIT / WITHDRAW ──────────────────────────────
const checkManifesto = (value) => {
    const text = String(value || '').trim()
    if (text.length < 20 || text.length > 1500) {
        throw { status: 400, message: 'Your manifesto must be between 20 and 1,500 characters.' }
    }
    return text
}

export const applyToPosition = async (memberId, { role, manifesto, file }) => {
    const election = await getOpenElection()
    if (!election || election.status !== 'applications') {
        throw { status: 400, message: 'Applications are not open right now.' }
    }

    const { rows: [pos] } = await pool.query(
        'SELECT 1 FROM election_positions WHERE election_id = $1 AND role = $2', [election.id, role])
    if (!pos) throw { status: 400, message: 'That position is not part of this election.' }

    const text = checkManifesto(manifesto)

    const { rows: [m] } = await pool.query(
        `SELECT m.id, m.role, m.is_dev, m.is_active, m.member_type, m.first_name, m.last_name,
                (s.service_end >= CURRENT_DATE + ($2 || ' months')::interval) AS enough_service
         FROM members m LEFT JOIN streams s ON s.id = m.stream_id
         WHERE m.id = $1`,
        [memberId, String(election.min_months_left)])

    if (!m || !m.is_active || m.member_type !== 'corps_member') {
        throw { status: 403, message: 'Only active corps members can run.' }
    }
    if (m.role === role) {
        throw { status: 403, message: "You already hold this position. Move up the ladder, or stay until your service year ends." }
    }
    if (!m.enough_service) {
        throw { status: 403, message: `You need at least ${election.min_months_left} months of service left to run.` }
    }
    if (await checkIfSuspended(memberId)) {
        throw { status: 403, message: 'Suspended members cannot run.' }
    }

    const photoPath = await uploadPhoto(file)
    try {
        const devRemoved = await withTransaction(async (client) => {
            let removed = false
            if (m.is_dev) {
                const devs = await client.query('SELECT id FROM members WHERE is_dev = true ORDER BY id FOR UPDATE')
                if (devs.rows.length < 2) {
                    throw { status: 409, message: 'You are the only dev, so you cannot run. Make another member a dev first.' }
                }
                await client.query(
                    'UPDATE members SET is_dev = false, token_version = token_version + 1 WHERE id = $1', [memberId])
                removed = true
            }
            await client.query(
                `INSERT INTO election_candidates (election_id, member_id, role, manifesto, photo_path)
                 VALUES ($1, $2, $3, $4, $5)`,
                [election.id, memberId, role, text, photoPath])
            return removed
        })

        if (devRemoved) {
            const { rows } = await pool.query('SELECT id FROM members WHERE is_dev = true')
            await Promise.all(rows.map(d => notifyMember(d.id, 'A dev is running in the election',
                `${m.first_name} ${m.last_name} applied for ${label(role)} and was removed as a dev. Grant it back from the Members tab after the election closes.`)))
        }
        return { applied: true, dev_removed: devRemoved }
    } catch (err) {
        await removePhotos([photoPath])
        if (err.code === '23505') throw { status: 409, message: 'You already have an application in this election.' }
        throw err
    }
}

export const updateApplication = async (memberId, { manifesto, file }) => {
    const election = await getOpenElection()
    if (!election || election.status !== 'applications') {
        throw { status: 400, message: 'Applications are closed, so they can no longer be edited.' }
    }
    const { rows: [c] } = await pool.query(
        `SELECT id, photo_path FROM election_candidates
         WHERE election_id = $1 AND member_id = $2 AND status = 'active'`, [election.id, memberId])
    if (!c) throw { status: 404, message: 'You have no application to edit.' }

    const text = manifesto === undefined ? null : checkManifesto(manifesto)
    const newPath = file ? await uploadPhoto(file) : null

    try {
        await pool.query(
            `UPDATE election_candidates
             SET manifesto = COALESCE($1, manifesto), photo_path = COALESCE($2, photo_path)
             WHERE id = $3`, [text, newPath, c.id])
    } catch (err) {
        await removePhotos([newPath])
        throw err
    }
    if (newPath) await removePhotos([c.photo_path])
    return { updated: true }
}

export const withdrawApplication = async (memberId) => {
    const election = await getOpenElection()
    if (!election || !['applications', 'review'].includes(election.status)) {
        throw { status: 400, message: 'You can only withdraw before voting starts.' }
    }
    const { rows } = await pool.query(
        `UPDATE election_candidates SET status = 'withdrawn'
         WHERE election_id = $1 AND member_id = $2 AND status = 'active'
         RETURNING id, photo_path`, [election.id, memberId])
    if (rows.length === 0) throw { status: 404, message: 'You have no application to withdraw.' }

    if (await removePhotos([rows[0].photo_path])) {
        await pool.query('UPDATE election_candidates SET photo_path = NULL WHERE id = $1', [rows[0].id])
    }
    return { withdrawn: true }
}

// ── MEMBER: VOTE ─────────────────────────────────────────────────
export const castVote = async (memberId, { role, candidateId }) => {
    const id = Number(candidateId)
    if (!Number.isInteger(id)) throw { status: 400, message: 'Choose a candidate.' }

    const e = await getOpenElection()
    if (!e || e.status !== 'voting') throw { status: 400, message: 'Voting is not open right now.' }

    const { rows: [voter] } = await pool.query(
        `SELECT 1 FROM members
         WHERE id = $1 AND is_active = true AND member_type = 'corps_member' AND created_at <= $2`,
        [memberId, e.voting_opened_at])
    if (!voter) throw { status: 403, message: 'You are not eligible to vote in this election.' }

    try {
        await withTransaction(async (client) => {
            const { rows: [c] } = await client.query(
                `SELECT (SELECT COUNT(*)::int FROM election_candidates
                         WHERE election_id = $1 AND role = $3 AND status = 'active') AS field_size
                 FROM election_candidates
                 WHERE id = $2 AND election_id = $1 AND role = $3 AND status = 'active'`,
                [e.id, id, role])
            if (!c) throw { status: 400, message: 'That candidate is not on this ballot.' }
            if (c.field_size < 2) throw { status: 400, message: 'This position is unopposed, so there is no vote.' }

            await client.query(
                'INSERT INTO election_voters (election_id, role, voter_id) VALUES ($1, $2, $3)',
                [e.id, role, memberId])
            await client.query('UPDATE election_candidates SET votes = votes + 1 WHERE id = $1', [id])
        })
    } catch (err) {
        if (err.code === '23505') throw { status: 409, message: 'You already have voted for this position.' }
        throw err
    }
    return { voted: true }
}

// ── RESULTS ──────────────────────────────────────────────────────
const buildResults = async (e) => {
    const { rows: cands } = await pool.query(
        `SELECT id, role, votes, profile FROM election_candidates
         WHERE election_id = $1 AND status = 'active'`, [e.id])
    const { rows: pos } = await pool.query(
        'SELECT role FROM election_positions WHERE election_id = $1 ORDER BY role', [e.id])
    const { rows: [t] } = await pool.query(
        'SELECT COUNT(DISTINCT voter_id)::int AS voted FROM election_voters WHERE election_id = $1', [e.id])

    const positions = pos.map(({ role }) => {
        const list = cands.filter(c => c.role === role)
        const sorted = [...list].sort((a, b) => b.votes - a.votes)
        const total = list.reduce((sum, c) => sum + c.votes, 0)
        const top = sorted[0]?.votes ?? 0
        const unopposed = list.length === 1
        const winners = unopposed ? list : (top > 0 ? sorted.filter(c => c.votes === top) : [])

        const status = list.length === 0 ? 'vacant'
            : unopposed ? 'unopposed'
            : winners.length === 0 ? 'no_result'
            : winners.length > 1 ? 'tie'
            : 'decided'

        return {
            role, status,
            candidates: sorted.map(c => ({
                id: c.id,
                name: `${c.profile?.first_name ?? ''} ${c.profile?.last_name ?? ''}`.trim(),
                state_code: c.profile?.state_code ?? null,
                votes: unopposed ? null : c.votes,
                percent: !unopposed && total > 0 ? Math.round((c.votes / total) * 100) : null,
                winner: winners.some(w => w.id === c.id)
            }))
        }
    })

    return { turnout: { voted: t.voted, eligible: e.eligible_voters }, positions }
}

// ── MEMBER: STATE ────────────────────────────────────────────────
export const getElectionStatus = async () => {
    const e = await getVisibleElection()
    return { visible: !!e, status: e?.status || null }
}

export const getElectionState = async (memberId) => {
    const e = await getVisibleElection()

    if (!e) return null
    
    const positions = await getPositions(e.id)
    const base = {
        id: e.id, title: e.title, status: e.status,
        min_months_left: e.min_months_left, closed_at: e.closed_at, positions
    }
    
    if (e.status === 'closed') return { ...base, results: await buildResults(e) }
    
    const { rows: [mine] } = await pool.query(
        `SELECT id, role, manifesto, photo_path FROM election_candidates
        WHERE election_id = $1 AND member_id = $2 AND status = 'active'`, [e.id, memberId])
        
        if (e.status === 'applications') {
            const urls = await signUrls([mine?.photo_path])
        return {
            ...base,
            my_application: mine
                ? { id: mine.id, role: mine.role, manifesto: mine.manifesto, photo_url: urls[mine.photo_path] || null }
                : null
        }
    }

    const { rows: cands } = await pool.query(
        `SELECT id, member_id, role, manifesto, photo_path, profile FROM election_candidates
         WHERE election_id = $1 AND status = 'active'
         ORDER BY role, profile->>'last_name', id`, [e.id])
    const urls = await signUrls(cands.map(c => c.photo_path))
    const state = {
        ...base,
        my_application: mine ? { id: mine.id, role: mine.role } : null,
        candidates: cands.map(c => ({
            id: c.id, role: c.role, manifesto: c.manifesto,
            photo_url: urls[c.photo_path] || null, profile: c.profile,
            is_mine: c.member_id === memberId
        }))
    }
    if (e.status === 'review') return state

    const { rows: voted } = await pool.query(
        'SELECT role FROM election_voters WHERE election_id = $1 AND voter_id = $2', [e.id, memberId])
    const { rows: [eligible] } = await pool.query(
        `SELECT 1 FROM members
         WHERE id = $1 AND is_active = true AND member_type = 'corps_member' AND created_at <= $2`,
        [memberId, e.voting_opened_at])
    const fieldSize = cands.reduce((acc, c) => ({ ...acc, [c.role]: (acc[c.role] || 0) + 1 }), {})

    return {
        ...state,
        can_vote: !!eligible,
        voted_roles: voted.map(r => r.role),
        unopposed_roles: Object.keys(fieldSize).filter(r => fieldSize[r] === 1)
    }
}

// ── DEV: STATE ───────────────────────────────────────────────────
export const getAdminState = async () => {
    const electable = await getElectablePositions()
    const election = await getOpenElection()
    
    if (!election) {
        const { rows: [last] } = await pool.query(
            "SELECT * FROM elections WHERE status = 'closed' ORDER BY id DESC LIMIT 1")

            return {
                election: null, electable,
                last_result: last
                ? { title: last.title, closed_at: last.closed_at, ...(await buildResults(last)) }
                : null
            }
        }
        
    const positions = await getPositions(election.id)
    const { rows: apps } = await pool.query(
        `SELECT c.id, c.role, c.manifesto, c.photo_path, m.first_name, m.last_name, m.state_code
         FROM election_candidates c JOIN members m ON m.id = c.member_id
         WHERE c.election_id = $1 AND c.status = 'active'
         ORDER BY c.role, c.id`, [election.id])
    const urls = await signUrls(apps.map(a => a.photo_path))
    const { rows: [t] } = await pool.query(
        'SELECT COUNT(DISTINCT voter_id)::int AS voted FROM election_voters WHERE election_id = $1', [election.id])

    return {
        election, electable,
        positions: positions.map(p => ({ ...p, candidates: apps.filter(a => a.role === p.role).length })),
        applications: apps.map(({ photo_path, ...a }) => ({ ...a, photo_url: urls[photo_path] || null })),
        turnout: election.status === 'voting' ? { voted: t.voted, eligible: election.eligible_voters } : null
    }
}