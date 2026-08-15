import pool from '../../config/db.js'

export const getAllStreams = async () => {
    const result = await pool.query(
        `SELECT * FROM streams ORDER BY year DESC, batch ASC, stream ASC`
    )
    return result.rows
}

export const getActiveStreams = async () => {
    const result = await pool.query(
        `SELECT * FROM streams 
        WHERE is_active = true 
        ORDER BY year DESC, batch ASC, stream ASC`
    )
    return result.rows
}

export const createStream = async (data) => {
    const { year, batch, stream, callup_date, service_end } = data

    const existing = await pool.query(
        'SELECT id FROM streams WHERE year = $1 AND batch = $2 AND stream = $3',
        [year, batch, stream]
    )
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'Stream already exists' }
    }

    const result = await pool.query(
        `INSERT INTO streams (year, batch, stream, callup_date, service_end)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [year, batch, stream, callup_date, service_end]
    )
    return result.rows[0]
}

export const toggleStreamActive = async (streamId) => {
    const result = await pool.query(
        `UPDATE streams 
        SET is_active = NOT is_active 
        WHERE id = $1 
        RETURNING *`,
        [streamId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Stream not found' }
    }
    return result.rows[0]
}