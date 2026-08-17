import pool from '../../config/db.js'
import { NOTIFICATION_TYPES } from '../../constants.js'

export const createNotification = async (memberId, title, message, type) => {
    const result = await pool.query(
        `INSERT INTO notifications (member_id, title, message, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [memberId, title, message, type]
    )
    return result.rows[0]
}

export const createNotificationForAll = async (title, message, type) => {
    // Get all active corps members
    const members = await pool.query(
        `SELECT m.id FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.member_type = 'corps_member'
        AND m.is_active = true
        AND s.service_end > NOW()`
    )

    const notifications = await Promise.all(
        members.rows.map(member =>
            createNotification(member.id, title, message, type)
        )
    )

    return notifications
}

export const getMyNotifications = async (memberId) => {
    const result = await pool.query(
        `SELECT * FROM notifications
        WHERE member_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
        [memberId]
    )
    return result.rows
}

export const getUnreadCount = async (memberId) => {
    const result = await pool.query(
        `SELECT COUNT(*) AS count FROM notifications
        WHERE member_id = $1 AND is_read = false`,
        [memberId]
    )
    return parseInt(result.rows[0].count)
}

export const markAsRead = async (memberId, notificationId) => {
    const result = await pool.query(
        `UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND member_id = $2
        RETURNING *`,
        [notificationId, memberId]
    )
    return result.rows[0]
}

export const markAllAsRead = async (memberId) => {
    await pool.query(
        `UPDATE notifications
        SET is_read = true
        WHERE member_id = $1 AND is_read = false`,
        [memberId]
    )
    return { success: true }
}