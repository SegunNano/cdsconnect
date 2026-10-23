import pool from '../../config/db.js'
import { hashPin, comparePin, validatePin } from '../../utils/pin.js'
import { getMe, getMemberForLogin } from '../members/members.service.js'
import { generateToken } from '../../utils/jwt.js'
import { cleanInput } from '../../middlewares/sanitizers.js'
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server'
import { getRpId } from '../../utils/utils.js'

const RP_NAME = 'CDSConnect'
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'
const RP_ID = getRpId(ORIGIN)

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

    // 1. Sanitize incoming text inputs thoroughly (with .trim())
    const cleanFirstName = cleanInput(first_name)
    const cleanLastName = cleanInput(last_name)
    const cleanStateCode = cleanInput(state_code)?.toUpperCase().trim()
    const cleanEmail = cleanInput(email)?.toLowerCase().trim()
    const cleanGender = cleanInput(gender)
    const cleanBreakout = cleanInput(breakout_session)

    // 2. Validate essential fields
    if (!cleanFirstName || !cleanLastName) {
        throw { status: 400, message: 'First name and last name are required.' }
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw { status: 400, message: 'A valid email address is required.' }
    }

    if (!cleanStateCode) {
        throw { status: 400, message: 'State code is required.' }
    }

    // Validate state code format — e.g. LA/26B/1879
    const stateCodeRegex = /^[A-Z]{2,3}\/[A-Z0-9]{3}\/\d{4,5}$/
    
    if (!stateCodeRegex.test(cleanStateCode)) {
        throw {
            status: 400,
            message: 'Invalid state code format. Expected format: LA/26B/1879 — two or three letters, slash, three alphanumeric characters, slash, four or five digits.'
        }
    }

    // 3. Validate PIN
    const pinValidation = validatePin(pin)
    if (!pinValidation.valid) {
        throw { status: 400, message: pinValidation.message }
    }

    if (pin !== confirm_pin) {
        throw { status: 400, message: 'PINs do not match' }
    }

    // 4. Check registration state
    const settings = await pool.query(
        'SELECT registration_open FROM settings LIMIT 1'
    )
    if (settings.rows.length > 0 && !settings.rows[0].registration_open) {
        throw { status: 403, message: 'Registration is currently closed. Contact the coordinator.' }
    }

    // 5. Check stream exists and is active
    const streamResult = await pool.query(
        'SELECT id FROM streams WHERE id = $1 AND is_active = true',
        [stream_id]
    )
    if (streamResult.rows.length === 0) {
        throw { status: 400, message: 'Invalid or inactive stream selected.' }
    }

    // 6. Application-level duplicate pre-check
    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1 OR state_code = $2',
        [cleanEmail, cleanStateCode]
    )
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'Email or state code already registered.' }
    }

    // 7. Hash PIN
    const pin_hash = await hashPin(pin)

    try {
        // 8. Insert member (Protected by database UNIQUE constraint against race conditions)
        const result = await pool.query(`
            INSERT INTO members (
                first_name, last_name, state_code, email,
                pin_hash, gender, stream_id, breakout_session,
                member_type
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, 'corps_member'
            ) RETURNING id
        `, [
            cleanFirstName, 
            cleanLastName,
            cleanStateCode, 
            cleanEmail,
            pin_hash, 
            cleanGender, 
            stream_id, 
            cleanBreakout
        ])

        const memberId = result.rows[0].id
        const member = await getMe(memberId)

        // 9. Generate JWT
        const token = generateToken({
            id: member.id,
            role: member.role,
            is_dev: member.is_dev,
            member_type: member.member_type,
            token_version: member.token_version
        })

        return { member, token }

    } catch (err) {
        // Fallback catch for database-level unique constraint violations (code 23505)
        if (err.code === '23505') {
            throw { status: 409, message: 'Email or state code already registered.' }
        }
        throw err
    }
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
        userID: new TextEncoder().encode(String(member.id)),
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

// ── WEBAUTHN REGISTRATION VERIFY ─────────────────

export const verifyRegistration = async (memberId, credential) => {
    if (!credential) {
        throw { status: 400, message: 'WebAuthn response credential is required' }
    }

    const result = await pool.query(
        'SELECT * FROM members WHERE id = $1',
        [memberId]
    )
    const member = result.rows[0]

    if (!member) {
        throw { status: 404, message: 'Member not found' }
    }

    if (!member.webauthn_challenge) {
        throw { status: 400, message: 'No registration challenge found for this member' }
    }

    const expectedUserID = Buffer.from(String(member.id)).toString('base64url')

    // Verify registration response
    const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: member.webauthn_challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        expectedUserID: expectedUserID,
        requireUserVerification: false // <--- FIXED: Prevents rejection if UV flag is not set by authenticator
    })

    if (!verification.verified || !verification.registrationInfo) {
        throw { status: 400, message: 'WebAuthn registration verification failed' }
    }

    const { id, publicKey, counter } = verification.registrationInfo.credential

    await pool.query(
        `UPDATE members 
         SET credential_id = $1, 
             public_key = $2, 
             sign_count = $3,
             webauthn_challenge = NULL
         WHERE id = $4`,
        [
            id,
            Buffer.from(publicKey).toString('base64url'),
            counter,
            memberId
        ]
    )

    return { verified: true, credentialId: id }
}

// ── WEBAUTHN LOGIN OPTIONS ────────────────────────

export const getAuthenticationOptions = async (email, clientCredentialId = null) => {
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
    
    if (member.credential_id || clientCredentialId) {
        if (!clientCredentialId || clientCredentialId !== member.credential_id) {
            throw {
                status: 403,
                message: 'This device is not authorised for this account. Contact your dev.'
            }
        }
    }

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: [{
            id: member.credential_id,
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

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const raw = result.rows[0]

    if (!raw.webauthn_challenge) {
        throw { status: 400, message: 'No active login challenge found for this member' }
    }

    const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: raw.webauthn_challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
            id: raw.credential_id,
            publicKey: Buffer.from(raw.public_key, 'base64url'),
            counter: Number(raw.sign_count)
        }
    })

    if (!verification.verified) {
        throw { status: 401, message: 'Authentication failed' }
    }

    // Update sign count
    await pool.query(
        'UPDATE members SET sign_count = $1, webauthn_challenge = NULL WHERE id = $2',
        [verification.authenticationInfo.newCounter, raw.id]
    )

    // Get full member with stream data
    const member = await getMe(raw.id)

    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev,
        member_type: member.member_type,
        token_version: member.token_version
    })

    return { member, token }
}

// ── PIN LOGIN (fallback) ──────────────────────────

export const loginWithPin = async (email, pin, clientCredentialId = null) => {
    const authMember = await getMemberForLogin(email)

    const pinMatch = await comparePin(pin, authMember.pin_hash)
    if (!pinMatch) {
        throw { status: 401, message: 'Incorrect PIN' }
    }

    const member = await getMe(authMember.id)

    if (member.credential_id && (!clientCredentialId || clientCredentialId !== member.credential_id)) {
        throw {
            status: 403,
            message: 'This device is not authorised for this account. Contact your dev.'
        }
    }

    const token = generateToken({
        id: member.id,
        role: member.role,
        is_dev: member.is_dev,
        member_type: member.member_type,
        token_version: member.token_version
    })

    return { member, token }
}