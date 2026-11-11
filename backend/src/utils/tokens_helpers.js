export const receiptNo = (id) => `RCT-${String(id).padStart(6, '0')}`

export const notify = (memberId, title, message) =>
    createNotification(memberId, title, message, NOTIFICATION_TYPES.TOPUP)
        .catch(err => console.error('Notification error:', err))

export const parseTokens = (value) => {
    const n = Number(value)
    if (!Number.isInteger(n) || n < 1 || n > MAX_TOKENS) {
        throw { status: 400, message: `Token amount must be a whole number from 1 to ${MAX_TOKENS}.` }
    }
    return n
}

export const withTransaction = async (fn) => {
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
export const creditTokens = async (client, { memberId, tokens, performedBy, requestId = null }) => {
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

