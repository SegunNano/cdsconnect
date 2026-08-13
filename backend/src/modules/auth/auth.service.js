import pool from '../../config/db.js'
import { hashPin, comparePin, validatePin } from '../../utils/pin.js'
import { generateToken } from '../../utils/jwt.js'

export const registerMember = async (data) => {
    const {
        first_name,
        last_name,
        state_code,
        email,
        pin,
        confirm_pin,
        gender,
        batch_year,
        batch,
        stream,
        breakout_session,
        date_of_callup,
        device_fingerprint
    } = data

    // Validate PIN
    const pinValidation = validatePin(pin)
    if (!pinValidation.valid) {
        throw { status: 400, message: pinValidation.message }
    }

    // Check PINs match
    if (pin !== confirm_pin) {
        throw { status: 400, message: 'PINs do not match' }
    }

    // Check registration is open
    const settings = await pool.query(
        'SELECT registration_open FROM settings LIMIT 1'
    )
    if (settings.rows.length > 0 && !settings.rows[0].registration_open) {
        throw { status: 403, message: 'Registration is currently closed. Contact your coordinator.' }
    }

    // Check duplicate email or state code
    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1 OR state_code = $2',
        [email, state_code]
    )
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'Email or state code already registered' }
    }
    // Check if device fingerprint already registered to another member
    if (device_fingerprint) {
        const existingDevice = await pool.query(
            'SELECT id FROM members WHERE device_fingerprint = $1',
            [device_fingerprint]
        )
        if (existingDevice.rows.length > 0) {
            throw { status: 409, message: 'This device is already registered to another member.' }
        }
    }

    // Calculate service_end — 1 year from date of callup
    const callupDate = new Date(date_of_callup)
    const serviceEnd = new Date(callupDate)
    serviceEnd.setFullYear(serviceEnd.getFullYear() + 1)

    // Hash PIN
    const pin_hash = await hashPin(pin)

    // Insert member
    const result = await pool.query(`
        INSERT INTO members (
            first_name, last_name, state_code, email,
            pin_hash, device_fingerprint, gender,
            batch_year, batch, stream, breakout_session,
            date_of_callup, service_end
        ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13
        ) RETURNING
            id, first_name, last_name, state_code,
            email, role, is_dev, gender,
            batch_year, batch, stream,
            breakout_session, date_of_callup,
            service_end, token_balance, is_active,
            created_at
    `, [
        first_name.trim(), last_name.trim(), state_code.trim().toUpperCase(), email,
        pin_hash, device_fingerprint, gender,
        batch_year, batch, stream, breakout_session,
        date_of_callup, serviceEnd
    ])

    const member = result.rows[0]

    // Generate JWT
    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev
    })

    return { member, token }
}

export const loginMember = async (email, pin, device_fingerprint) => {

    // Find member
    const result = await pool.query(
        'SELECT * FROM members WHERE email = $1',
        [email]
    )

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = result.rows[0]

    // Check if active
    if (!member.is_active) {
        throw { status: 403, message: 'Your account is inactive. Contact your dev.' }
    }

    // Check service end
    if (new Date() > new Date(member.service_end)) {
        throw { status: 403, message: 'Your service year has ended.' }
    }

    // Verify PIN
    const pinMatch = await comparePin(pin, member.pin_hash)
    if (!pinMatch) {
        throw { status: 401, message: 'Incorrect PIN' }
    }

    // Device fingerprint check
    if (!member.device_fingerprint) {
        // Check if fingerprint belongs to another member
        const existingDevice = await pool.query(
            'SELECT id FROM members WHERE device_fingerprint = $1 AND id != $2',
            [device_fingerprint, member.id]
        )
        if (existingDevice.rows.length > 0) {
            throw {
                status: 409,
                message: 'This device is already registered to another member.'
            }
        }
        // Bind device
        await pool.query(
            'UPDATE members SET device_fingerprint = $1 WHERE id = $2',
            [device_fingerprint, member.id]
        )
    } else if (member.device_fingerprint !== device_fingerprint) {
        throw {
            status: 403,
            message: 'Device not recognised. Contact your dev to reset your device.'
        }
    }

    // Generate JWT
    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev
    })

    const { pin_hash, device_fingerprint: df, ...safeMember } = member

    return { member: safeMember, token }
}