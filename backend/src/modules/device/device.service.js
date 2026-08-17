import pool from '../../config/db.js'

export const resetMemberDevice = async (devId, memberId) => {
    // Can't reset your own device this way
    if (parseInt(devId) === parseInt(memberId)) {
        throw { status: 400, message: 'You cannot reset your own device from here. Use the PIN reset instead.' }
    }

    const memberResult = await pool.query(
        'SELECT id, first_name, last_name FROM members WHERE id = $1',
        [memberId]
    )

    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found.' }
    }

    await pool.query(
        `UPDATE members 
        SET credential_id = NULL, 
            public_key = NULL,
            sign_count = 0,
            webauthn_challenge = NULL
        WHERE id = $1`,
        [memberId]
    )

    return {
        success: true,
        member: memberResult.rows[0],
        message: `Device reset for ${memberResult.rows[0].first_name} ${memberResult.rows[0].last_name}. They can now log in on a new device.`
    }
}