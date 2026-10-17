import {
    getCertificateStatus, payForCertificates,
    buildMembershipCertificate, buildExcellenceCertificate,
    getPaidMembers
} from './certificates.service.js'

export const getStatus = async (req, res, next) => {
    try {
        const data = await getCertificateStatus(req.member.id)
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const pay = async (req, res, next) => {
    try {
        const data = await payForCertificates(req.member.id)
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const downloadMembership = async (req, res, next) => {
    try {
        const memberId = req.query.memberId || req.member.id
        const buffer = await buildMembershipCertificate(parseInt(memberId))
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-membership-${Date.now()}.pdf"`,
            'Content-Length': buffer.length
        })
        res.send(buffer)
    } catch (err) { next(err) }
}

export const downloadExcellence = async (req, res, next) => {
    try {
        const memberId = req.query.memberId || req.member.id
        const buffer = await buildExcellenceCertificate(parseInt(memberId))
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-excellence-${Date.now()}.pdf"`,
            'Content-Length': buffer.length
        })
        res.send(buffer)
    } catch (err) { next(err) }
}

export const paidMembersList = async (req, res, next) => {
    try {
        const data = await getPaidMembers()
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

// GET /api/certificates/collate-status

export const getCollateStatus = async () => {
    const result = await pool.query(
        `SELECT 
            COUNT(cp.id) AS paid_count,
            COUNT(CASE WHEN s.certificate_unlocked = true THEN 1 END) AS active_streams
        FROM streams s
        LEFT JOIN certificate_payments cp ON cp.stream_id = s.id`
    )

    const { paid_count, active_streams } = result.rows[0]
    return {
        show_tab: parseInt(active_streams) > 0 || parseInt(paid_count) > 0,
        paid_count: parseInt(paid_count)
    }
}

export const getCollateData = async () => {
    const result = await pool.query(
        `SELECT 
            s.id AS stream_id,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number,
            s.certificate_unlocked,
            s.certificates_distributed,
            m.id AS member_id,
            m.first_name,
            m.last_name,
            m.state_code,
            m.role,
            cp.paid_at,
            cp.tokens_paid
        FROM streams s
        JOIN certificate_payments cp ON cp.stream_id = s.id
        JOIN members m ON cp.member_id = m.id
        WHERE s.certificates_distributed = false
        ORDER BY s.callup_date DESC, m.last_name ASC`
    )

    // Group by stream
    const grouped = {}
    result.rows.forEach(row => {
        const key = row.stream_id
        if (!grouped[key]) {
            grouped[key] = {
                stream_id: row.stream_id,
                stream_year: row.stream_year,
                stream_batch: row.stream_batch,
                stream_number: row.stream_number,
                certificate_unlocked: row.certificate_unlocked,
                members: []
            }
        }
        grouped[key].members.push({
            id: row.member_id,
            first_name: row.first_name,
            last_name: row.last_name,
            state_code: row.state_code,
            role: row.role,
            is_exco: row.role !== 'member',
            paid_at: row.paid_at
        })
    })

    return Object.values(grouped)
}