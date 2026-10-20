import pool from '../../config/db.js'
import { createNotification } from '../notifications/notifications.service.js'

export const logExpense = async (coordinatorId, amount, description) => {

    const expensesResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM expenses'
    )
    
    const tokenIncomeResult = await pool.query(
        'SELECT COALESCE(SUM(naira_value), 0) AS total FROM topups'
    )
    const externalIncomeResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM income'
    )
    
    const totalExpenses = parseInt(expensesResult.rows[0].total)
    const totalIncome = parseInt(tokenIncomeResult.rows[0].total) + parseInt(externalIncomeResult.rows[0].total)
    const balance = totalIncome - totalExpenses
    
    if (amount > balance) {
        throw {
            status: 400,
            message: `Insufficient funds. Current balance is ₦${(totalIncome - totalExpenses).toLocaleString()}.`
        }
    }


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
    const tokenIncomeResult = await pool.query(
        'SELECT COALESCE(SUM(naira_value), 0) AS total FROM topups'
    )
    const externalIncomeResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM income'
    )
    const expensesResult = await pool.query(
        'SELECT COALESCE(SUM(amount_naira), 0) AS total FROM expenses'
    )
    const topupsResult = await pool.query(
        `SELECT t.*,
            m.first_name AS member_first_name,
            m.last_name AS member_last_name,
            m.state_code,
            tr.first_name AS treasurer_first_name,
            tr.last_name AS treasurer_last_name
        FROM topups t
        JOIN members m ON t.member_id = m.id
        JOIN members tr ON t.performed_by = tr.id
        ORDER BY t.created_at DESC`
    )
    const expenseListResult = await pool.query(
        `SELECT e.*,
            m.first_name, m.last_name
        FROM expenses e
        JOIN members m ON e.performed_by = m.id
        ORDER BY e.created_at DESC`
    )
    const incomeListResult = await pool.query(
        `SELECT i.*,
            m.first_name, m.last_name
        FROM income i
        JOIN members m ON i.recorded_by = m.id
        ORDER BY i.created_at DESC`
    )

    const tokenIncome = parseInt(tokenIncomeResult.rows[0].total)
    const externalIncome = parseInt(externalIncomeResult.rows[0].total)
    const totalExpenses = parseInt(expensesResult.rows[0].total)
    const totalIncome = tokenIncome + externalIncome

    return {
        token_income: tokenIncome,
        external_income: externalIncome,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        topups: topupsResult.rows,
        expenses: expenseListResult.rows,
        external_income_list: incomeListResult.rows
    }
}