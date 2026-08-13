import pool from '../../config/db.js'

export const getMe = async (memberId) => {
    const result = await pool.query(
        `SELECT 
            id, first_name, last_name, state_code,
            email, role, is_dev, gender,
            batch_year, batch, stream,
            breakout_session, date_of_callup,
            service_end, token_balance, is_active,
            created_at
        FROM members 
        WHERE id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    return result.rows[0]
}

export const getAllMembers = async () => {
    const result = await pool.query(
        `SELECT 
            id, first_name, last_name, state_code,
            email, role, is_dev, gender,
            batch_year, batch, stream,
            breakout_session, date_of_callup,
            service_end, token_balance, is_active,
            created_at
        FROM members
        ORDER BY created_at DESC`
    )
    return result.rows
}

export const updateMemberRole = async (memberId, role) => {
    const result = await pool.query(
        `UPDATE members 
        SET role = $1 
        WHERE id = $2 
        RETURNING id, first_name, last_name, role`,
        [role, memberId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }
    return result.rows[0]
}

export const toggleDevAccess = async (adminId, targetMemberId) => {
    // Can't remove your own dev access
    if (adminId === targetMemberId) {
        throw { status: 400, message: 'You cannot change your own dev access' }
    }

    // At least one dev must always exist
    const devCount = await pool.query(
        'SELECT COUNT(*) FROM members WHERE is_dev = true'
    )
    const member = await pool.query(
        'SELECT is_dev FROM members WHERE id = $1',
        [targetMemberId]
    )

    if (member.rows[0].is_dev && parseInt(devCount.rows[0].count) === 1) {
        throw { status: 400, message: 'At least one dev must exist on the platform' }
    }

    const result = await pool.query(
        `UPDATE members 
        SET is_dev = NOT is_dev 
        WHERE id = $1 
        RETURNING id, first_name, last_name, is_dev`,
        [targetMemberId]
    )
    return result.rows[0]
}

export const resetDeviceFingerprint = async (memberId) => {
    const result = await pool.query(
        `UPDATE members 
        SET device_fingerprint = NULL 
        WHERE id = $1 
        RETURNING id, first_name, last_name`,
        [memberId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }
    return result.rows[0]
}

export const extendServiceYear = async (memberId, newEndDate, reason) => {
    const result = await pool.query(
        `UPDATE members 
        SET service_end = $1, extension_reason = $2
        WHERE id = $3
        RETURNING id, first_name, last_name, service_end`,
        [newEndDate, reason, memberId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }
    return result.rows[0]
}

export const deactivateMember = async (memberId) => {
    const result = await pool.query(
        `UPDATE members 
        SET is_active = false
        WHERE id = $1
        RETURNING id, first_name, last_name, is_active`,
        [memberId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }
    return result.rows[0]
}