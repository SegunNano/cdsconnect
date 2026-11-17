import pool from '../config/db.js'
import { comparePin } from './pin.js'

// 403, not 401, so the app doesn't treat a wrong PIN as a logout
export const verifyMemberPin = async (memberId, pin) => {
    const { rows: [m] } = await pool.query('SELECT pin_hash FROM members WHERE id = $1', [memberId])
    if (!m || !(await comparePin(String(pin || ''), m.pin_hash))) {
        throw { status: 403, message: 'Incorrect PIN.' }
    }
}