import pool from '../../config/db.js'
import { hashPin, validatePin } from '../../utils/pin.js'

export const resetPin = async (memberId, newPin, confirmPin) => {
    // Validate PIN
    const pinValidation = validatePin(newPin)
    if (!pinValidation.valid) {
        throw { status: 400, message: pinValidation.message }
    }

    if (newPin !== confirmPin) {
        throw { status: 400, message: 'PINs do not match.' }
    }

    const pinHash = await hashPin(newPin)

    await pool.query(
        'UPDATE members SET pin_hash = $1 WHERE id = $2',
        [pinHash, memberId]
    )

    return { success: true, message: 'PIN updated successfully.' }
}