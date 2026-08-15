import pool from '../../config/db.js'

export const getSettings = async () => {
    const result = await pool.query('SELECT * FROM settings LIMIT 1')
    return result.rows[0]
}

export const toggleRegistration = async () => {
    const settings = await getSettings()

    // If trying to open registration, check active streams exist
    if (!settings.registration_open) {
        const activeStreams = await pool.query(
            'SELECT id FROM streams WHERE is_active = true LIMIT 1'
        )
        if (activeStreams.rows.length === 0) {
            throw {
                status: 400,
                message: 'No active streams available. Create a stream first before opening registration.',
                code: 'NO_ACTIVE_STREAMS'
            }
        }
    }

    const result = await pool.query(
        `UPDATE settings 
        SET registration_open = NOT registration_open 
        WHERE id = $1 
        RETURNING *`,
        [settings.id]
    )
    return result.rows[0]
}

export const getRegistrationStatus = async () => {
    const settings = await getSettings()
    const activeStreams = await pool.query(
        'SELECT * FROM streams WHERE is_active = true ORDER BY year DESC, batch ASC, stream ASC'
    )
    return {
        registration_open: settings.registration_open,
        active_streams: activeStreams.rows
    }
}