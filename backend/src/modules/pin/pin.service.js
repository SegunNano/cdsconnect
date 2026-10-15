import pool from '../../config/db.js'
import { comparePin, hashPin, validatePin } from '../../utils/pin.js'
import { createNotification } from '../notifications/notifications.service.js'

export const resetPin = async (memberId, currentPin, newPin, confirmPin) => {
    const pinValidation = validatePin(newPin)
    if (!pinValidation.valid) {
        throw { status: 400, message: pinValidation.message }
    }

    if (newPin !== confirmPin) {
        throw { status: 400, message: 'PINs do not match.' }
    }

    // Verify current PIN first
    const result = await pool.query(
        'SELECT pin_hash FROM members WHERE id = $1',
        [memberId]
    )
    const match = await comparePin(currentPin, result.rows[0].pin_hash)
    if (!match) {
        throw { status: 401, message: 'Current PIN is incorrect.' }
    }

    const pinHash = await hashPin(newPin)
    await pool.query(
        'UPDATE members SET pin_hash = $1, token_version = token_version + 1 WHERE id = $2',
        [pinHash, memberId]
    )

    // Notify member
    await createNotification(
        memberId,
        'PIN Changed',
        'Your PIN was just changed. If this was not you, contact your dev immediately.',
        'security'
    )

    return { success: true, message: 'PIN updated successfully.' }
}