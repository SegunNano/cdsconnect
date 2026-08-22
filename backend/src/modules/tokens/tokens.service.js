import pool from '../../config/db.js'
import { RATE, NOTIFICATION_TYPES } from '../../constants.js'
import { createNotification } from '../notifications/notifications.service.js'

export const topUpTokens = async (treasurerId, memberId, tokensToAdd) => {
    // Verify treasurer exists
    const treasurerResult = await pool.query(
        'SELECT id, role FROM members WHERE id = $1',
        [treasurerId]
    )
    if (treasurerResult.rows.length === 0) {
        throw { status: 404, message: 'Treasurer not found' }
    }

    // Verify member exists
    const memberResult = await pool.query(
        'SELECT id, first_name, last_name, token_balance FROM members WHERE id = $1',
        [memberId]
    )
    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = memberResult.rows[0]
    const nairaValue = tokensToAdd * RATE

    // Add tokens to member balance
    const updatedMember = await pool.query(
        `UPDATE members 
        SET token_balance = token_balance + $1 
        WHERE id = $2
        RETURNING id, first_name, last_name, token_balance`,
        [tokensToAdd, memberId]
    )

    // Record topup
    await pool.query(
        `INSERT INTO topups (member_id, tokens_added, naira_value, performed_by)
        VALUES ($1, $2, $3, $4)`,
        [memberId, tokensToAdd, nairaValue, treasurerId]
    )

    await createNotification(
        memberId,
        'Tokens Added',
        `${tokensToAdd} token(s) have been added to your account. New balance: ${updatedMember.rows[0].token_balance} tokens.`,
        NOTIFICATION_TYPES.TOPUP
    )

    return {
        member: updatedMember.rows[0],
        tokens_added: tokensToAdd,
        naira_value: nairaValue,
        previous_balance: member.token_balance,
        new_balance: updatedMember.rows[0].token_balance
    }
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

export const getMyTopUpHistory = async (memberId)=> {
        // Get topups
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

        // Get deductions from attendance
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

        // Combine and sort by date
        const history = [
            ...topupsResult.rows,
            ...deductionsResult.rows
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