import pool from '../../config/db.js'
import { hashPin, comparePin, validatePin } from '../../utils/pin.js'
import { generateToken } from '../../utils/jwt.js'
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server'

const RP_NAME = 'CDSConnect'
const RP_ID = process.env.RP_ID || 'localhost'
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── REGISTRATION ─────────────────────────────────

export const registerMember = async (data) => {
    const {
        first_name,
        last_name,
        state_code,
        email,
        pin,
        confirm_pin,
        gender,
        stream_id,
        breakout_session
    } = data

    // Validate PIN
    const pinValidation = validatePin(pin)
    if (!pinValidation.valid) {
        throw { status: 400, message: pinValidation.message }
    }

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

    // Check stream exists and is active
    const streamResult = await pool.query(
        'SELECT * FROM streams WHERE id = $1 AND is_active = true',
        [stream_id]
    )
    if (streamResult.rows.length === 0) {
        throw { status: 400, message: 'Invalid or inactive stream selected.' }
    }

    // Check duplicate email or state code
    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1 OR state_code = $2',
        [email, state_code]
    )
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'Email or state code already registered.' }
    }

    // Hash PIN
    const pin_hash = await hashPin(pin)

    // Insert member
    const result = await pool.query(`
        INSERT INTO members (
            first_name, last_name, state_code, email,
            pin_hash, gender, stream_id, breakout_session
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING
            id, first_name, last_name, state_code,
            email, role, is_dev, gender,
            stream_id, breakout_session,
            token_balance, is_active, created_at
    `, [
        first_name.trim(), last_name.trim(),
        state_code.trim(), email,
        pin_hash, gender, stream_id, breakout_session
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

// ── WEBAUTHN REGISTRATION OPTIONS ────────────────

export const getRegistrationOptions = async (memberId) => {
    const result = await pool.query(
        'SELECT * FROM members WHERE id = $1',
        [memberId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = result.rows[0]

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: String(member.id),
        userName: member.email,
        userDisplayName: `${member.first_name} ${member.last_name}`,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform'
        }
    })

    // Store challenge temporarily
    await pool.query(
        'UPDATE members SET webauthn_challenge = $1 WHERE id = $2',
        [options.challenge, memberId]
    )

    return options
}

// ── WEBAUTHN REGISTRATION VERIFY ─────────────────

export const verifyRegistration = async (memberId, credential) => {
    const result = await pool.query(
        'SELECT * FROM members WHERE id = $1',
        [memberId]
    )
    const member = result.rows[0]

    const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: member.webauthn_challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID
    })

    if (!verification.verified) {
        throw { status: 400, message: 'WebAuthn registration failed' }
    }

    const { credentialID, credentialPublicKey, counter } =
        verification.registrationInfo

    // Save credential to member
    await pool.query(
        `UPDATE members 
        SET credential_id = $1, public_key = $2, sign_count = $3,
            webauthn_challenge = NULL
        WHERE id = $4`,
        [
            Buffer.from(credentialID).toString('base64url'),
            Buffer.from(credentialPublicKey).toString('base64url'),
            counter,
            memberId
        ]
    )

    return { verified: true }
}

// ── WEBAUTHN LOGIN OPTIONS ────────────────────────

export const getAuthenticationOptions = async (email) => {
    const result = await pool.query(
        'SELECT * FROM members WHERE email = $1',
        [email]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = result.rows[0]

    if (!member.credential_id) {
        throw { status: 400, message: 'No device registered. Please register your device first.' }
    }

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: [{
            id: Buffer.from(member.credential_id, 'base64url'),
            type: 'public-key'
        }],
        userVerification: 'preferred'
    })

    // Store challenge
    await pool.query(
        'UPDATE members SET webauthn_challenge = $1 WHERE id = $2',
        [options.challenge, member.id]
    )

    return options
}

// ── WEBAUTHN LOGIN VERIFY ─────────────────────────

export const verifyAuthentication = async (email, credential) => {
    const result = await pool.query(
        'SELECT * FROM members WHERE email = $1',
        [email]
    )
    const member = result.rows[0]

    const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: member.webauthn_challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        authenticator: {
            credentialID: Buffer.from(member.credential_id, 'base64url'),
            credentialPublicKey: Buffer.from(member.public_key, 'base64url'),
            counter: member.sign_count
        }
    })

    if (!verification.verified) {
        throw { status: 401, message: 'Authentication failed' }
    }

    // Update sign count
    await pool.query(
        'UPDATE members SET sign_count = $1, webauthn_challenge = NULL WHERE id = $2',
        [verification.authenticationInfo.newCounter, member.id]
    )

    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev
    })

    const { pin_hash, public_key, credential_id, webauthn_challenge, ...safeMember } = member

    return { member: safeMember, token }
}

// ── PIN LOGIN (fallback) ──────────────────────────

export const loginWithPin = async (email, pin) => {
    const result = await pool.query(
        `SELECT m.*, 
            s.callup_date, s.service_end,
            s.year, s.batch, s.stream
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.email = $1`,
        [email]
    )

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = result.rows[0]



    const pinMatch = await comparePin(pin, member.pin_hash)
    if (!pinMatch) {
        throw { status: 401, message: 'Incorrect PIN' }
    }

    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev
    })

    const { pin_hash, public_key, credential_id, webauthn_challenge, sign_count, ...safeMember } = member

    return { member: safeMember, token }
}