import pool from '../../config/db.js'
import { ROLES } from '../../constants.js'

export const getMemberForLogin = async (email) => {
    const result = await pool.query(
        `SELECT
            id,
            email,
            pin_hash,
            role,
            is_dev,
            member_type
        FROM members
        WHERE email = $1`,
        [email]
    )

    if (result.rows.length === 0) {
        throw {
            status: 401,
            message: 'Invalid email or PIN'
        }
    }

    return result.rows[0]
}

export const getMe = async (memberId) => {
    const result = await pool.query(
        `SELECT 
            m.id, m.first_name, m.last_name, m.state_code,
            m.email, m.role, m.is_dev, m.gender,
            m.stream_id, m.breakout_session,
            m.token_balance, m.is_active, m.member_type,
            m.credential_id,
            m.created_at,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.callup_date,
            s.service_end
        FROM members m
        LEFT JOIN streams s ON m.stream_id = s.id
        WHERE m.id = $1`,
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
            m.id, m.first_name, m.last_name, m.state_code,
            m.email, m.role, m.is_dev, m.gender,
            m.stream_id, m.breakout_session,
            m.token_balance, m.is_active, m.member_type,
            m.created_at,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.callup_date,
            s.service_end
        FROM members m
        LEFT JOIN streams s ON m.stream_id = s.id
        ORDER BY m.created_at DESC`
    )
    return result.rows
}

export const updateMemberRole = async (memberId, role) => {
    // Validate that the requested role actually exists
    if (!ROLES.includes(role)) {
        throw { status: 400, message: `Invalid role: ${role}` }
    }

    // Any role other than 'member' is treated as a single-holder role
    if (role !== 'member') {
        const existing = await pool.query(
            'SELECT id, first_name, last_name FROM members WHERE role = $1 AND id != $2',
            [role, memberId]
        )
        if (existing.rows.length > 0) {
            const holder = existing.rows[0]
            const formattedRole = role.replace(/_/g, ' ')
            throw {
                status: 409,
                message: `${formattedRole} is already assigned to ${holder.first_name} ${holder.last_name}. Remove it from them first.`
            }
        }
    }

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
    if (adminId === targetMemberId) {
        throw { status: 400, message: 'You cannot change your own dev access' }
    }

    const member = await pool.query(
        'SELECT is_dev FROM members WHERE id = $1',
        [targetMemberId]
    )

    const isCurrentlyDev = member.rows[0].is_dev

    if (!isCurrentlyDev) {
        // Trying to grant dev — check limit
        const devCount = await pool.query(
            'SELECT COUNT(*) FROM members WHERE is_dev = true'
        )
        if (parseInt(devCount.rows[0].count) >= 2) {
            throw { 
                status: 400, 
                message: 'Maximum of 2 devs allowed. Remove a dev first.' 
            }
        }
    } else {
        // Trying to remove dev — ensure at least 1 remains
        const devCount = await pool.query(
            'SELECT COUNT(*) FROM members WHERE is_dev = true'
        )
        if (parseInt(devCount.rows[0].count) === 1) {
            throw { 
                status: 400, 
                message: 'At least one dev must exist on the platform.' 
            }
        }
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

export const updateMemberProfile = async (memberId, data) => {
    const { first_name, last_name, gender, breakout_session } = data

    const result = await pool.query(
        `UPDATE members SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            gender = COALESCE($3, gender),
            breakout_session = COALESCE($4, breakout_session)
        WHERE id = $5
        RETURNING *`,
        [first_name, last_name, gender, breakout_session, memberId]
    )

    return await getMe(memberId)
}