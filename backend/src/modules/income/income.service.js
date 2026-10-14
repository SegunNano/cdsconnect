import pool from '../../config/db.js'
import { createNotification } from '../notifications/notifications.service.js'

export const logIncome = async (memberId, amount, description, source) => {
    const result = await pool.query(
        `INSERT INTO income (amount_naira, description, source, recorded_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [amount, description, source, memberId]
    )

    // Get logger name
    const logger = await pool.query(
        'SELECT first_name, last_name, role FROM members WHERE id = $1',
        [memberId]
    )
    const { first_name, last_name, role } = logger.rows[0]

    // Notify coordinator
    const coordinators = await pool.query(
        `SELECT id FROM members WHERE member_type = 'staff'`
    )
    await Promise.all(coordinators.rows.map(c =>
        createNotification(
            c.id,
            'External Income Recorded',
            `${first_name} ${last_name} recorded an external income of ₦${amount.toLocaleString()} from ${source} — ${description}`,
            'income_logged'
        )
    ))

    return result.rows[0]
}

export const getAllIncome = async () => {
    const result = await pool.query(
        `SELECT i.*,
            m.first_name, m.last_name
        FROM income i
        JOIN members m ON i.recorded_by = m.id
        ORDER BY i.created_at DESC`
    )
    return result.rows
}
