import pool from '../../config/db.js'
import { RATE, NOTIFICATION_TYPES, PROOF_BUCKET, MAX_TOKENS, DIRECT_TOPUP_ROLES, STATUSES, ALLOWED_PROOF } from '../../constants.js'
import { createNotification } from '../notifications/notifications.service.js'
import crypto from 'crypto'
import supabase from '../../config/supabase.js'


// ── HELPERS ──────────────────────────────────────────────────────
const receiptNo = (id) => `RCT-${String(id).padStart(6, '0')}`

const notify = (memberId, title, message) =>
    createNotification(memberId, title, message, NOTIFICATION_TYPES.TOPUP)
        .catch(err => console.error('Notification error:', err))

const parseTokens = (value) => {
    const n = Number(value)
    if (!Number.isInteger(n) || n < 1 || n > MAX_TOKENS) {
        throw { status: 400, message: `Token amount must be a whole number from 1 to ${MAX_TOKENS}.` }
    }
    return n
}

const withTransaction = async (fn) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await fn(client)
        await client.query('COMMIT')
        return result
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

// The single place tokens are credited: manual top-up, approvals, and
// later the Paystack webhook. Must run inside a transaction.
const creditTokens = async (client, { memberId, tokens, performedBy, requestId = null }) => {
    const member = await client.query(
        `UPDATE members SET token_balance = token_balance + $1
         WHERE id = $2 AND is_active = true AND member_type = 'corps_member'
         RETURNING id, first_name, last_name, token_balance`,
        [tokens, memberId]
    )
    if (member.rows.length === 0) {
        throw { status: 404, message: 'Active corps member not found.' }
    }

    const nairaValue = tokens * RATE
    const topup = await client.query(
        `INSERT INTO topups (member_id, tokens_added, naira_value, performed_by, topup_request_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [memberId, tokens, nairaValue, performedBy, requestId]
    )

    return { member: member.rows[0], nairaValue, topupId: topup.rows[0].id }
}

// ── PROOF FILES (private bucket) ─────────────────────────────────
export const uploadProof = async (file) => {
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(file.buffer)
    if (!type || !ALLOWED_PROOF.includes(type.mime)) {
        throw { status: 400, message: 'Proof must be a JPG, PNG, WebP or PDF.' }
    }
    const path = `${crypto.randomBytes(16).toString('hex')}.${type.ext}`
    const { error } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(path, file.buffer, { contentType: type.mime })
    if (error) throw { status: 500, message: 'Could not upload proof. Try again.' }
    return path
}

// Best effort: never blocks a decision. Leftovers are swept by maintenance.
const removeProof = async (path, requestId) => {
    if (!path) return
    const { error } = await supabase.storage.from(PROOF_BUCKET).remove([path])
    if (error) {
        console.error(`Proof delete failed (request ${requestId ?? 'new'}):`, error.message)
        return
    }
    if (requestId) {
        await pool.query('UPDATE topup_requests SET proof_path = NULL WHERE id = $1', [requestId])
    }
}

// ── MANUAL TOP-UP (treasurer / financial secretary, at the venue) ─
export const topUpTokens = async (treasurerId, memberId, tokensToAdd) => {
    const tokens = parseTokens(tokensToAdd)

    const { member, nairaValue } = await withTransaction(client =>
        creditTokens(client, { memberId, tokens, performedBy: treasurerId })
    )

    notify(
        memberId,
        'Tokens Added',
        `${tokens} token(s) have been added to your account. New balance: ${member.token_balance} tokens.`
    )

    return {
        member,
        tokens_added: tokens,
        naira_value: nairaValue,
        previous_balance: member.token_balance - tokens,
        new_balance: member.token_balance
    }
}

// ── TOP-UP REQUESTS: MEMBER SIDE ─────────────────────────────────
export const createTopUpRequest = async (memberId, { tokensRequested, senderName, transferReference, proofPath = null }) => {
    try {
        const tokens = parseTokens(tokensRequested)
        const sender = String(senderName || '').trim()
        const reference = String(transferReference || '').trim()

        if (sender.length < 2 || sender.length > 100) {
            throw { status: 400, message: 'Enter the name on the account you paid from.' }
        }
        if (reference.length < 4 || reference.length > 64) {
            throw { status: 400, message: 'Enter the transfer reference or session ID from your bank.' }
        }

        const { rows: [member] } = await pool.query(
            'SELECT role, member_type, is_active FROM members WHERE id = $1',
            [memberId]
        )
        if (!member || !member.is_active || member.member_type !== 'corps_member') {
            throw { status: 403, message: 'Your account cannot submit top-up requests.' }
        }
        if (DIRECT_TOPUP_ROLES.includes(member.role)) {
            throw { status: 403, message: 'Treasurer and financial secretary top-ups are done directly, not by request.' }
        }

        const { rows } = await pool.query(
            `INSERT INTO topup_requests
                (member_id, tokens_requested, naira_value, sender_name, transfer_reference, proof_path, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             RETURNING id, tokens_requested, naira_value, status, created_at`,
            [memberId, tokens, tokens * RATE, sender, reference, proofPath]
        )
        return rows[0]
    } catch (err) {
        await removeProof(proofPath, null)   // never leave an orphaned upload

        if (err.code === '23505') {
            if (err.constraint === 'one_pending_request_per_member') {
                throw { status: 409, message: 'You already have a pending request. Cancel it or wait for review.' }
            }
            throw { status: 409, message: 'This transfer reference is already in use on another request.' }
        }
        throw err
    }
}

export const cancelTopUpRequest = async (memberId, requestId) => {
    // The status condition makes this atomic against a simultaneous review
    const { rows } = await pool.query(
        `UPDATE topup_requests SET status = 'cancelled', cancelled_at = NOW()
         WHERE id = $1 AND member_id = $2 AND status = 'pending'
         RETURNING proof_path`,
        [requestId, memberId]
    )
    if (rows.length === 0) {
        throw { status: 404, message: 'No pending request found to cancel.' }
    }

    await removeProof(rows[0].proof_path, requestId)
    return { success: true, status: 'cancelled' }
}

export const getMyTopUpRequests = async (memberId) => {
    const { rows } = await pool.query(
        `SELECT id, tokens_requested, tokens_approved, naira_value, status,
                treasurer_note, created_at, reviewed_at,
                CASE WHEN status = 'approved'
                     THEN 'RCT-' || LPAD(id::text, 6, '0') END AS receipt_no
         FROM topup_requests
         WHERE member_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [memberId]
    )
    return rows
}

// ── TOP-UP REQUESTS: REVIEWER SIDE ───────────────────────────────
export const getPendingTopUpCount = async () => {
    const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS count FROM topup_requests WHERE status = 'pending'"
    )
    return rows[0].count
}

export const getTreasurerTopUpRequests = async ({ status = 'pending', limit = 50 } = {}) => {
    if (!STATUSES.includes(status)) {
        throw { status: 400, message: 'Invalid status filter.' }
    }
    const cap = Math.min(Number(limit) || 50, 100)
    // pending: oldest first so nothing gets buried; others: newest first
    const order = status === 'pending' ? 'tr.created_at ASC' : 'tr.created_at DESC'

    const { rows } = await pool.query(
        `SELECT tr.id, tr.tokens_requested, tr.tokens_approved, tr.naira_value,
                tr.sender_name, tr.transfer_reference, tr.proof_path, tr.status,
                tr.treasurer_note, tr.created_at, tr.reviewed_at,
                m.first_name AS member_first_name, m.last_name AS member_last_name, m.state_code,
                rev.first_name AS reviewer_first_name, rev.last_name AS reviewer_last_name
         FROM topup_requests tr
         JOIN members m ON tr.member_id = m.id
         LEFT JOIN members rev ON tr.reviewed_by = rev.id
         WHERE tr.status = $1
         ORDER BY ${order}
         LIMIT $2`,
        [status, cap]
    )

    // Short-lived signed links, so the stored path is never exposed
    return Promise.all(rows.map(async ({ proof_path, ...row }) => {
        if (!proof_path) return { ...row, proof_url: null }
        const { data } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(proof_path, 300)
        return { ...row, proof_url: data?.signedUrl || null }
    }))
}

export const reviewTopUpRequest = async (reviewerId, requestId, { action, adjustedTokens, treasurerNote }) => {
    const note = String(treasurerNote || '').trim() || null

    const result = await withTransaction(async (client) => {
        const { rows } = await client.query(
            'SELECT * FROM topup_requests WHERE id = $1 FOR UPDATE',
            [requestId]
        )
        if (rows.length === 0) {
            throw { status: 404, message: 'Top-up request not found.' }
        }

        const request = rows[0]
        if (request.status !== 'pending') {
            throw { status: 400, message: `This request is already ${request.status}.` }
        }
        if (request.member_id === reviewerId) {
            throw { status: 403, message: 'You cannot review your own request.' }
        }

        if (action === 'reject') {
            if (!note) {
                throw { status: 400, message: 'A reason is required when rejecting a request.' }
            }
            await client.query(
                `UPDATE topup_requests
                 SET status = 'rejected', treasurer_note = $1, reviewed_by = $2, reviewed_at = NOW()
                 WHERE id = $3`,
                [note, reviewerId, requestId]
            )
            return { request, status: 'rejected' }
        }

        if (action === 'approve') {
            const hasAdjustment = adjustedTokens !== undefined && adjustedTokens !== null && adjustedTokens !== ''
            const approved = hasAdjustment ? parseTokens(adjustedTokens) : request.tokens_requested

            if (approved !== request.tokens_requested && !note) {
                throw { status: 400, message: 'Add a note explaining why the amount was changed.' }
            }

            const { member } = await creditTokens(client, {
                memberId: request.member_id,
                tokens: approved,
                performedBy: reviewerId,
                requestId
            })

            // tokens_requested and naira_value keep what the member asked for
            await client.query(
                `UPDATE topup_requests
                 SET status = 'approved', tokens_approved = $1, treasurer_note = $2,
                     reviewed_by = $3, reviewed_at = NOW()
                 WHERE id = $4`,
                [approved, note, reviewerId, requestId]
            )
            return { request, status: 'approved', approved, member }
        }

        throw { status: 400, message: 'Invalid action. Use approve or reject.' }
    })

    // After the commit: delete the proof, then tell the member
    await removeProof(result.request.proof_path, requestId)

    if (result.status === 'rejected') {
        notify(
            result.request.member_id,
            'Top-Up Request Rejected',
            `Your top-up request was not approved. Reason: ${note}`
        )
        return { success: true, status: 'rejected' }
    }

    const changed = result.approved !== result.request.tokens_requested
    notify(
        result.request.member_id,
        'Top-Up Approved 🎉',
        `${changed
            ? `Your request for ${result.request.tokens_requested} token(s) was approved as ${result.approved} token(s). `
            : `Your request for ${result.approved} token(s) was approved. `}` +
        `${note ? `Note: ${note}. ` : ''}Receipt ${receiptNo(requestId)}. ` +
        `New balance: ${result.member.token_balance} tokens.`
    )

    return {
        success: true,
        status: 'approved',
        tokens_approved: result.approved,
        receipt_no: receiptNo(requestId),
        member: result.member
    }
}

// ── MAINTENANCE ──────────────────────────────────────────────────
export const runTopUpMaintenance = async () => {
    // 1. Retry any proof deletes that failed earlier
    const { rows } = await pool.query(
        `SELECT id, proof_path FROM topup_requests
         WHERE status <> 'pending' AND proof_path IS NOT NULL
         LIMIT 50`
    )
    for (const r of rows) await removeProof(r.proof_path, r.id)

    // 2. Delete old rejected/cancelled rows (approved rows are the receipts, kept forever)
    await pool.query(
        `DELETE FROM topup_requests
         WHERE status IN ('rejected', 'cancelled')
           AND proof_path IS NULL
           AND COALESCE(reviewed_at, cancelled_at) < NOW() - ($1 || ' days')::interval`,
        [String(RETENTION_DAYS)]
    )
}

export const startTopUpMaintenance = () => {
    setInterval(() => runTopUpMaintenance().catch(console.error), 6 * 60 * 60 * 1000)
}

export const getMemberTopUpHistory = async (memberId) => {
    const result = await pool.query(
        `SELECT t.*, 
            m.first_name AS treasurer_first_name,
            m.last_name AS treasurer_last_name
        FROM topups t
        JOIN members m ON t.performed_by = m.id
        WHERE t.member_id = $1
        ORDER BY t.created_at DESC`,
        [memberId]
    )
    return result.rows
}

export const getMyTopUpHistory = async (memberId) => {
    // 1. Top-ups
    const topupsResult = await pool.query(
        `SELECT 
            'topup' AS type,
            t.tokens_added AS tokens,
            t.naira_value,
            t.created_at,
            m.first_name AS performed_by_first,
            m.last_name AS performed_by_last
        FROM topups t
        JOIN members m ON t.performed_by = m.id
        WHERE t.member_id = $1`,
        [memberId]
    )

    // 2. Deductions (Attendance)
    const deductionsResult = await pool.query(
        `SELECT 
            'deduction' AS type,
            a.tokens_deducted AS tokens,
            (a.tokens_deducted * $2) AS naira_value,
            a.signed_in_at AS created_at,
            mt.title AS meeting_title,
            a.is_late,
            CASE 
                WHEN a.excuse_id IS NOT NULL THEN 'excuse'
                WHEN a.marked_present_by IS NOT NULL THEN 'manual'
                ELSE 'attendance'
            END AS deduction_type
        FROM attendance a
        JOIN meetings mt ON a.meeting_id = mt.id
        WHERE a.member_id = $1`,
        [memberId, RATE]
    )

    // 3. Transfers Sent
    const transfersSentResult = await pool.query(
        `SELECT 
            'transfer_sent' AS type,
            tt.tokens AS tokens,
            tt.created_at,
            m.first_name AS recipient_name,
            m.last_name AS recipient_last,
            m.state_code AS recipient_state_code
        FROM token_transfers tt
        JOIN members m ON tt.recipient_id = m.id
        WHERE tt.sender_id = $1`,
        [memberId]
    )

    // 4. Transfers Received
    const transfersReceivedResult = await pool.query(
        `SELECT 
            'transfer_received' AS type,
            tt.tokens AS tokens,
            tt.created_at,
            m.first_name AS sender_name,
            m.last_name AS sender_last,
            m.state_code AS sender_state_code
        FROM token_transfers tt
        JOIN members m ON tt.sender_id = m.id
        WHERE tt.recipient_id = $1`,
        [memberId]
    )

    // Combine & sort all timeline events
    const history = [
        ...topupsResult.rows,
        ...deductionsResult.rows,
        ...transfersSentResult.rows,
        ...transfersReceivedResult.rows
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return history
}

export const getAllTopUps = async () => {
    const result = await pool.query(
        `SELECT t.*,
            mem.first_name AS member_first_name,
            mem.last_name AS member_last_name,
            mem.state_code,
            tr.first_name AS treasurer_first_name,
            tr.last_name AS treasurer_last_name
        FROM topups t
        JOIN members mem ON t.member_id = mem.id
        JOIN members tr ON t.performed_by = tr.id
        ORDER BY t.created_at DESC`
    )
    return result.rows
}

export const transferTokens = async (senderId, recipientStateCode, tokensToTransfer) => {
    if (tokensToTransfer < 1) {
        throw { status: 400, message: 'Must transfer at least 1 token.' }
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        const senderResult = await client.query(
            'SELECT id, first_name, last_name, token_balance FROM members WHERE id = $1 FOR UPDATE',
            [senderId]
        )
        const sender = senderResult.rows[0]

        if (sender.token_balance < tokensToTransfer) {
            throw {
                status: 400,
                message: `Insufficient tokens. You have ${sender.token_balance} token${sender.token_balance !== 1 ? 's' : ''}.`
            }
        }

        const recipientResult = await client.query(
            `SELECT id, first_name, last_name, token_balance, is_active, member_type
            FROM members WHERE state_code = $1`,
            [recipientStateCode.toUpperCase().trim()]
        )

        if (recipientResult.rows.length === 0) {
            throw { status: 404, message: 'Member with that state code not found.' }
        }

        const recipient = recipientResult.rows[0]

        if (recipient.id === senderId) {
            throw { status: 400, message: 'You cannot transfer tokens to yourself.' }
        }

        if (!recipient.is_active) {
            throw { status: 400, message: 'That member account is no longer active.' }
        }

        if (recipient.member_type !== 'corps_member') {
            throw { status: 400, message: 'Tokens can only be transferred to corps members.' }
        }

        await client.query(
            'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
            [tokensToTransfer, senderId]
        )

        await client.query(
            'UPDATE members SET token_balance = token_balance + $1 WHERE id = $2',
            [tokensToTransfer, recipient.id]
        )

        await client.query(
            `INSERT INTO token_transfers (sender_id, recipient_id, tokens)
            VALUES ($1, $2, $3)`,
            [senderId, recipient.id, tokensToTransfer]
        )

        await client.query('COMMIT')

        await createNotification(
            senderId,
            'Tokens Sent',
            `You sent ${tokensToTransfer} token${tokensToTransfer !== 1 ? 's' : ''} to ${recipient.first_name} ${recipient.last_name} (${recipientStateCode.toUpperCase()}).`,
            'token_transfer'
        ).catch(err => console.error('Notification error:', err))

        await createNotification(
            recipient.id,
            'Tokens Received 🎉',
            `${sender.first_name} ${sender.last_name} sent you ${tokensToTransfer} token${tokensToTransfer !== 1 ? 's' : ''}.`,
            'token_transfer'
        ).catch(err => console.error('Notification error:', err))

        return {
            sent: tokensToTransfer,
            recipient_name: `${recipient.first_name} ${recipient.last_name}`,
            new_balance: sender.token_balance - tokensToTransfer
        }

    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}
