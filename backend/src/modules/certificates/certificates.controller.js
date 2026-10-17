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