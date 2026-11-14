import pool from '../../config/db.js'
import { comparePin } from '../../utils/pin.js'
import { createNotification } from '../notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../../constants.js'

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


export const getPaymentAccount = async ({ includeMeta = false } = {}) => {
    const { rows } = await pool.query(
        `SELECT l.bank_name, l.account_number, l.account_name, l.created_at AS updated_at,
                m.first_name AS updated_by_first, m.last_name AS updated_by_last
         FROM payment_account_log l
         LEFT JOIN members m ON l.changed_by = m.id
         ORDER BY l.id DESC LIMIT 1`
    )
    const row = rows[0]
    if (!row) return null
    // Members only see the three fields; who changed it is for devs
    return includeMeta ? row : {
        bank_name: row.bank_name,
        account_number: row.account_number,
        account_name: row.account_name
    }
}

export const updatePaymentAccount = async (devId, { bankName, accountNumber, accountName, pin }) => {
    const bank = String(bankName || '').trim()
    const number = String(accountNumber || '').replace(/\s/g, '')
    const name = String(accountName || '').trim()

    if (bank.length < 2 || bank.length > 60) throw { status: 400, message: 'Enter a valid bank name.' }
    if (!/^\d{10}$/.test(number)) throw { status: 400, message: 'Account number must be exactly 10 digits.' }
    if (name.length < 2 || name.length > 100) throw { status: 400, message: 'Enter a valid account name.' }

    // Confirm it is really this dev
    const { rows: [dev] } = await pool.query('SELECT pin_hash FROM members WHERE id = $1', [devId])
    if (!dev || !(await comparePin(String(pin || ''), dev.pin_hash))) {
        throw { status: 403, message: 'Incorrect PIN.' }
    }

    const current = await getPaymentAccount()
    if (current && current.bank_name === bank && current.account_number === number && current.account_name === name) {
        throw { status: 400, message: 'These are already the current account details.' }
    }

    // UPDATE the existing row instead of inserting a new log
    await pool.query(
        `UPDATE payment_account_log 
         SET bank_name = $1, account_number = $2, account_name = $3, changed_by = $4
         WHERE id = (SELECT id FROM payment_account_log ORDER BY id DESC LIMIT 1)`,
        [bank, number, name, devId]
    )

    // Tell the people who handle the money
    const { rows: people } = await pool.query(
        `SELECT id FROM members
         WHERE is_active = true AND id <> $1
           AND (role IN ('treasurer', 'financial_secretary', 'coordinator') OR is_dev = true)`,
        [devId]
    )
    await Promise.all(people.map(p =>
        createNotification(
            p.id,
            'Payment account changed',
            `Token payments now go to ${name}, ${bank}, account ending ${number.slice(-4)}. ` +
            `Requests sent before this were paid to the old account, so check each one before approving.`,
            NOTIFICATION_TYPES.PAYMENT_ACCOUNT
        ).catch(err => console.error('Notification error:', err))
    ))

    return getPaymentAccount({ includeMeta: true })
}