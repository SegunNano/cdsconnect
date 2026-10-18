import pool from '../../config/db.js'
import { createNotification } from '../notifications/notifications.service.js'
import {
    generateExcellenceCertificate,
    generateMembershipCertificate
} from '../../utils/certificate-pdf.js'


// ── BUILD MEMBERSHIP CERTIFICATE ──────────────────────────────────
export const buildMembershipCertificate = async (memberId) => {
    const result = await pool.query(
        `SELECT
            m.first_name,
            m.last_name,
            m.state_code,
            m.role,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.service_end
         FROM members m
         JOIN streams s ON m.stream_id = s.id
         JOIN certificate_payments cp
            ON cp.member_id = m.id AND cp.stream_id = s.id
         WHERE m.id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) {
        throw {
            status: 403,
            message: 'No certificate payment found.'
        }
    }

    return generateMembershipCertificate(result.rows[0])
}

// ── BUILD EXCELLENCE CERTIFICATE ──────────────────────────────────
export const buildExcellenceCertificate = async (memberId) => {
    const result = await pool.query(
        `SELECT
            m.first_name,
            m.last_name,
            m.state_code,
            m.role,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.service_end
         FROM members m
         JOIN streams s ON m.stream_id = s.id
         JOIN certificate_payments cp
            ON cp.member_id = m.id AND cp.stream_id = s.id
         WHERE m.id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) {
        throw {
            status: 403,
            message: 'No certificate payment found.'
        }
    }

    if (result.rows[0].role === 'member') {
        throw {
            status: 403,
            message: 'Certificate of Excellence is only for Exco members.'
        }
    }

    return generateExcellenceCertificate(result.rows[0])
}

// ── CHECK CERTIFICATE STATUS ──────────────────────────────────────
export const getCertificateStatus = async (memberId) => {
    const result = await pool.query(
        `SELECT
            s.id AS stream_id,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.service_end,
            s.certificate_unlocked,
            s.certificate_cost_tokens,
            cp.id AS payment_id,
            cp.paid_at,
            m.role,
            m.token_balance
         FROM members m
         JOIN streams s ON m.stream_id = s.id
         LEFT JOIN certificate_payments cp
            ON cp.member_id = m.id AND cp.stream_id = s.id
         WHERE m.id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    const isExco = row.role !== 'member'

    return {
        stream_id: row.stream_id,
        stream_year: row.stream_year,
        stream_batch: row.stream_batch,
        stream_number: row.stream_number,
        service_end: row.service_end,
        certificate_unlocked: row.certificate_unlocked,
        certificate_cost_tokens: row.certificate_cost_tokens,
        has_paid: Boolean(row.payment_id),
        paid_at: row.paid_at,
        is_exco: isExco,
        role: row.role,
        token_balance: row.token_balance
    }
}

// ── PAY FOR CERTIFICATES ──────────────────────────────────────────
export const payForCertificates = async (memberId) => {
    const status = await getCertificateStatus(memberId)

    if (!status) {
        throw { status: 404, message: 'Stream not found.' }
    }

    if (!status.certificate_unlocked) {
        throw {
            status: 403,
            message: 'Certificates have not been unlocked for your batch yet.'
        }
    }

    if (status.has_paid) {
        throw {
            status: 409,
            message: 'You have already paid for your certificates.'
        }
    }

    if (status.token_balance < status.certificate_cost_tokens) {
        throw {
            status: 400,
            message: `Insufficient tokens. You need ${status.certificate_cost_tokens} tokens but have ${status.token_balance}.`
        }
    }

    // Deduct tokens.
    await pool.query(
        'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
        [status.certificate_cost_tokens, memberId]
    )

    // Record payment.
    await pool.query(
        `INSERT INTO certificate_payments (member_id, stream_id, tokens_paid)
         VALUES ($1, $2, $3)`,
        [memberId, status.stream_id, status.certificate_cost_tokens]
    )

    // Notify member.
    await createNotification(
        memberId,
        'Certificates Ready 🎓',
        `Your certificate${status.is_exco ? 's are' : ' is'} ready. Download ${status.is_exco ? 'them' : 'it'} from the Clearance section.`,
        'certificate_ready'
    )

    return { success: true, is_exco: status.is_exco }
}

// ── GET ALL PAID MEMBERS ──────────────────────────────────────────
export const getPaidMembers = async () => {
    const result = await pool.query(
        `SELECT
            m.id,
            m.first_name,
            m.last_name,
            m.state_code,
            m.role,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            cp.paid_at,
            cp.tokens_paid
         FROM certificate_payments cp
         JOIN members m ON cp.member_id = m.id
         JOIN streams s ON cp.stream_id = s.id
         ORDER BY s.callup_date DESC, m.last_name ASC`
    )

    return result.rows
}
