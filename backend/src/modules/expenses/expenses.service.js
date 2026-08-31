import pool from '../../config/db.js'
import { createNotification } from '../notifications/notifications.service.js'

export const logExpense = async (coordinatorId, amount, description) => {
    // Check treasury has enough
    const incomeResult = await pool.query(
        'SELECT COALESCE(SUM(naira_value), 0) AS total FROM topups'
    )
    const expensesResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM expenses'
    )

    const totalIncome = parseInt(incomeResult.rows[0].total)
    const totalExpenses = parseInt(expensesResult.rows[0].total)
    const balance = totalIncome - totalExpenses

    if (amount > balance) {
        throw {
            status: 400,
            message: `Insufficient funds. Current balance is ₦${balance.toLocaleString()}.`
        }
    }

    const result = await pool.query(
        `INSERT INTO expenses (amount_naira, description, performed_by)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [amount, description, coordinatorId]
    )


    const loggerResult = await pool.query(
        'SELECT first_name, last_name, role FROM members WHERE id = $1',
        [coordinatorId]
    )
    const logger = loggerResult.rows[0]

    // Notify all coordinators
    const coordinators = await pool.query(
        `SELECT id FROM members 
        WHERE member_type = 'staff'`
    )

    await Promise.all(coordinators.rows.map(c =>
        createNotification(
            c.id,
            'Expense Logged',
            `${logger.first_name} ${logger.last_name} (${logger.role.replace('_', ' ')}) logged an expense of ₦${amount.toLocaleString()} — ${description}`,
            'expense_logged'
        )
    ))

    return {
        expense: result.rows[0],
        previous_balance: balance,
        new_balance: balance - amount
    }
}


export const getAllExpenses = async () => {
    const result = await pool.query(
        `SELECT e.*,
            m.first_name, m.last_name
        FROM expenses e
        JOIN members m ON e.performed_by = m.id
        ORDER BY e.created_at DESC`
    )
    return result.rows
}

export const getTreasurySummary = async () => {
    const incomeResult = await pool.query(
        'SELECT COALESCE(SUM(naira_value), 0) AS total FROM topups'
    )
    const expensesResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM expenses'
    )
    const topupsResult = await pool.query(
        `SELECT t.*,
            m.first_name, m.last_name, m.state_code
        FROM topups t
        JOIN members m ON t.member_id = m.id
        ORDER BY t.created_at DESC`
    )
    const expenseListResult = await pool.query(
        `SELECT e.*,
            m.first_name, m.last_name
        FROM expenses e
        JOIN members m ON e.performed_by = m.id
        ORDER BY e.created_at DESC`
    )

    const totalIncome = parseInt(incomeResult.rows[0].total)
    const totalExpenses = parseInt(expensesResult.rows[0].total)

    return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        topups: topupsResult.rows,
        expenses: expenseListResult.rows
    }
}