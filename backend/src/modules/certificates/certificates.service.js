import { generateExcellenceCertificate, generateMembershipCertificate } from "../../utils/certificate.js"

export const buildMembershipCertificate = async (memberId) => {
    const result = await pool.query(
        `SELECT 
            m.first_name, m.last_name, m.state_code, m.role,
            s.year AS stream_year, s.batch AS stream_batch,
            s.stream AS stream_number, s.service_end
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        JOIN certificate_payments cp 
            ON cp.member_id = m.id AND cp.stream_id = s.id
        WHERE m.id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) {
        throw { status: 403, message: 'No certificate payment found.' }
    }

    return generateMembershipCertificate(result.rows[0])
}

export const buildExcellenceCertificate = async (memberId) => {
    const result = await pool.query(
        `SELECT 
            m.first_name, m.last_name, m.state_code, m.role,
            s.year AS stream_year, s.batch AS stream_batch,
            s.stream AS stream_number, s.service_end
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        JOIN certificate_payments cp 
            ON cp.member_id = m.id AND cp.stream_id = s.id
        WHERE m.id = $1`,
        [memberId]
    )

    if (result.rows.length === 0) {
        throw { status: 403, message: 'No certificate payment found.' }
    }

    if (result.rows[0].role === 'member') {
        throw { status: 403, message: 'Certificate of Excellence is only for Exco members.' }
    }

    return generateExcellenceCertificate(result.rows[0])
}


import pool from '../../config/db.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNotification } from '../notifications/notifications.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nyscLogoPath = path.join(__dirname, '../../assets/nysc-logo.png')
const infoTechLogoPath = path.join(__dirname, '../../assets/infotech-logo.png')
const coordinatorSignaturePath = path.join(__dirname, '../../assets/coordinator-signature.png')

// ── CHECK IF MEMBER'S STREAM HAS CERTIFICATES UNLOCKED ──────────
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
        has_paid: !!row.payment_id,
        paid_at: row.paid_at,
        is_exco: isExco,
        role: row.role,
        token_balance: row.token_balance
    }
}

// ── PAY FOR CERTIFICATES ─────────────────────────────────────────
export const payForCertificates = async (memberId) => {
    const status = await getCertificateStatus(memberId)

    if (!status) {
        throw { status: 404, message: 'Stream not found.' }
    }
    if (!status.certificate_unlocked) {
        throw { status: 403, message: 'Certificates have not been unlocked for your batch yet.' }
    }
    if (status.has_paid) {
        throw { status: 409, message: 'You have already paid for your certificates.' }
    }
    if (status.token_balance < status.certificate_cost_tokens) {
        throw {
            status: 400,
            message: `Insufficient tokens. You need ${status.certificate_cost_tokens} tokens but have ${status.token_balance}.`
        }
    }

    // Deduct tokens
    await pool.query(
        'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
        [status.certificate_cost_tokens, memberId]
    )

    // Record payment
    await pool.query(
        `INSERT INTO certificate_payments (member_id, stream_id, tokens_paid)
        VALUES ($1, $2, $3)`,
        [memberId, status.stream_id, status.certificate_cost_tokens]
    )

    // Notify member
    await createNotification(
        memberId,
        'Certificates Ready 🎓',
        `Your certificate${status.is_exco ? 's are' : ' is'} ready. Download ${status.is_exco ? 'them' : 'it'} from the Clearance section.`,
        'certificate_ready'
    )

    return { success: true, is_exco: status.is_exco }
}



// ── GET ALL PAID MEMBERS (for secretary/exco download) ──────────
export const getPaidMembers = async () => {
    const result = await pool.query(
        `SELECT 
            m.id, m.first_name, m.last_name,
            m.state_code, m.role,
            s.year AS stream_year, s.batch AS stream_batch,
            s.stream AS stream_number,
            cp.paid_at, cp.tokens_paid
        FROM certificate_payments cp
        JOIN members m ON cp.member_id = m.id
        JOIN streams s ON cp.stream_id = s.id
        ORDER BY s.callup_date DESC, m.last_name ASC`
    )
    return result.rows
}

// ── PDF GENERATORS ───────────────────────────────────────────────
const formatRole = (role) => {
    const roles = {
        president: 'President',
        vice_president: 'Vice President',
        secretary: 'General Secretary',
        treasurer: 'Treasurer',
        financial_secretary: 'Financial Secretary',
        pro: 'Public Relations Officer',
        welfare: 'Welfare Officer',
        coordinator: 'Coordinator'
    }
    return roles[role] || role.replace('_', ' ')
}

const drawHeader = (doc, PAGE_WIDTH) => {
    // Green top bar
    doc.rect(0, 0, PAGE_WIDTH, 10).fill('#008751')

    const logoY = 28
    if (fs.existsSync(nyscLogoPath)) {
        doc.image(nyscLogoPath, 45, logoY, { width: 60 })
    }
    if (fs.existsSync(infoTechLogoPath)) {
        doc.image(infoTechLogoPath, PAGE_WIDTH - 100, logoY + 5, { width: 55 })
    }

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14)
        .text('NATIONAL YOUTH SERVICE CORPS', 0, 32, { align: 'center', width: PAGE_WIDTH })
    doc.fontSize(10).fillColor('#333333')
        .text('FEDERAL REPUBLIC OF NIGERIA', 0, 50, { align: 'center', width: PAGE_WIDTH })
    doc.fillColor('#008751').fontSize(10).font('Helvetica-Bold')
        .text('INFOTECH CDS GROUP · LAGOS STATE', 0, 64, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(45, 90).lineTo(PAGE_WIDTH - 45, 90)
        .strokeColor('#d0d8d3').lineWidth(1).stroke()
}

const drawSignatureBlock = (doc, PAGE_WIDTH, serviceEnd) => {
    const sigY = doc.y + 20

    const dateStr = serviceEnd
        ? new Date(serviceEnd + 'T12:00:00Z').toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
          })
        : new Date().toLocaleDateString('en-GB')

    // Date line
    doc.moveTo(45, sigY).lineTo(200, sigY)
        .strokeColor('#000000').lineWidth(1).stroke()
    doc.font('Helvetica').fontSize(9).fillColor('#0d1b12')
        .text(dateStr, 45, sigY + 5)
    doc.fontSize(8).fillColor('#8fa396')
        .text('DATE', 45, sigY + 18)

    // Signature image
    if (fs.existsSync(coordinatorSignaturePath)) {
        doc.image(coordinatorSignaturePath, PAGE_WIDTH - 220, sigY - 45, { height: 55 })
    }
    doc.moveTo(PAGE_WIDTH - 220, sigY).lineTo(PAGE_WIDTH - 45, sigY)
        .strokeColor('#000000').lineWidth(1).stroke()
    doc.fontSize(8).fillColor('#8fa396')
        .text("COORDINATOR'S SIGNATURE", PAGE_WIDTH - 220, sigY + 18)
}

const drawFooter = (doc, PAGE_WIDTH, PAGE_HEIGHT) => {
    doc.fontSize(7).fillColor('#8fa396')
        .text(
            `CDSConnect · InfoTech CDS Lagos State · Generated ${new Date().toLocaleDateString('en-GB')}`,
            0, PAGE_HEIGHT - 30,
            { align: 'center', width: PAGE_WIDTH }
        )
    // Green bottom bar
    doc.rect(0, PAGE_HEIGHT - 10, PAGE_WIDTH, 10).fill('#008751')
}

const generateMembershipPdf = (member) => {
    const PAGE_WIDTH = 841.89  // A4 landscape
    const PAGE_HEIGHT = 595.28

    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        userPassword: '',
        ownerPassword: `CERT-MEMB-${member.state_code}`,
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: true,
            documentAssembly: false
        },
        info: {
            Title: `Certificate of Membership — ${member.first_name} ${member.last_name}`,
            Author: 'CDSConnect System'
        }
    })

    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

    drawHeader(doc, PAGE_WIDTH)

    // WATERMARK
    doc.save()
    doc.rotate(-30, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] })
    doc.fontSize(80).font('Helvetica-Bold').fillColor('#008751').fillOpacity(0.04)
        .text('INFOTECH CDS', 100, PAGE_HEIGHT / 2 - 60, { lineBreak: false })
    doc.restore()

    // CERTIFICATE TITLE
    doc.fillOpacity(1)
    doc.fillColor('#008751').font('Helvetica-Bold').fontSize(28)
        .text('Certificate of Membership', 0, 110, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(PAGE_WIDTH / 2 - 150, 150).lineTo(PAGE_WIDTH / 2 + 150, 150)
        .strokeColor('#008751').lineWidth(1.5).stroke()

    // BODY
    doc.fillColor('#333333').font('Helvetica').fontSize(13)
        .text('This is to certify that', 0, 168, { align: 'center', width: PAGE_WIDTH })

    // Member Name
    const fullName = `${member.first_name} ${member.last_name}`
    doc.fillColor('#0d1b12').font('Helvetica-Bold').fontSize(20)
        .text(fullName, 0, 195, { align: 'center', width: PAGE_WIDTH })

    const nameWidth = doc.widthOfString(fullName, { fontSize: 20 })
    const nameX = (PAGE_WIDTH - Math.min(nameWidth, 400)) / 2
    doc.moveTo(nameX, 222).lineTo(nameX + Math.min(nameWidth, 400), 222)
        .strokeColor('#0d1b12').lineWidth(1).stroke()

    doc.fillColor('#333333').font('Helvetica').fontSize(12)
        .text('with state code', 0, 235, { align: 'center', width: PAGE_WIDTH, continued: true })
        .font('Helvetica-Bold').text(`  ${member.state_code}  `, { continued: false })

    doc.moveDown(0.8)
    doc.font('Helvetica').fontSize(12).fillColor('#333333')
        .text(
            `was a MEMBER of InfoTech CDS Group, Lagos State`,
            0, doc.y, { align: 'center', width: PAGE_WIDTH }
        )
    doc.text(
        'in the National Youth Service Corps Scheme.',
        0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
    )

    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11).fillColor('#008751')
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
        )

    drawSignatureBlock(doc, PAGE_WIDTH, member.service_end)
    drawFooter(doc, PAGE_WIDTH, PAGE_HEIGHT)

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}

const generateExcellencePdf = (member) => {
    const PAGE_WIDTH = 841.89
    const PAGE_HEIGHT = 595.28

    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        userPassword: '',
        ownerPassword: `CERT-EXCEL-${member.state_code}`,
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: true,
            documentAssembly: false
        },
        info: {
            Title: `Certificate of Excellence — ${member.first_name} ${member.last_name}`,
            Author: 'CDSConnect System'
        }
    })

    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

    drawHeader(doc, PAGE_WIDTH)

    // WATERMARK
    doc.save()
    doc.rotate(-30, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] })
    doc.fontSize(80).font('Helvetica-Bold').fillColor('#d4900a').fillOpacity(0.04)
        .text('INFOTECH CDS', 100, PAGE_HEIGHT / 2 - 60, { lineBreak: false })
    doc.restore()

    // CERTIFICATE TITLE — gold for excellence
    doc.fillOpacity(1)
    doc.fillColor('#b8860b').font('Helvetica-Bold').fontSize(28)
        .text('Certificate of Excellence', 0, 110, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(PAGE_WIDTH / 2 - 150, 150).lineTo(PAGE_WIDTH / 2 + 150, 150)
        .strokeColor('#b8860b').lineWidth(1.5).stroke()

    // BODY
    doc.fillColor('#333333').font('Helvetica').fontSize(13)
        .text('This is to certify that', 0, 168, { align: 'center', width: PAGE_WIDTH })

    const fullName = `${member.first_name} ${member.last_name}`
    doc.fillColor('#0d1b12').font('Helvetica-Bold').fontSize(20)
        .text(fullName, 0, 195, { align: 'center', width: PAGE_WIDTH })

    const nameWidth = doc.widthOfString(fullName, { fontSize: 20 })
    const nameX = (PAGE_WIDTH - Math.min(nameWidth, 400)) / 2
    doc.moveTo(nameX, 222).lineTo(nameX + Math.min(nameWidth, 400), 222)
        .strokeColor('#0d1b12').lineWidth(1).stroke()

    doc.fillColor('#333333').font('Helvetica').fontSize(12)
        .text('with state code', 0, 235, { align: 'center', width: PAGE_WIDTH, continued: true })
        .font('Helvetica-Bold').text(`  ${member.state_code}  `, { continued: false })

    doc.moveDown(0.8)

    const roleFormatted = formatRole(member.role).toUpperCase()
    const batchLabel = `${member.stream_year} Batch ${member.stream_batch}`

    doc.font('Helvetica').fontSize(12).fillColor('#333333')
        .text(
            `successfully served as ${roleFormatted}`,
            0, doc.y, { align: 'center', width: PAGE_WIDTH }
        )
    doc.text(
        `of ${batchLabel} InfoTech CDS Group, Lagos State`,
        0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
    )
    doc.text(
        'in the National Youth Service Corps Scheme.',
        0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
    )

    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11).fillColor('#b8860b')
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
        )

    drawSignatureBlock(doc, PAGE_WIDTH, member.service_end)
    drawFooter(doc, PAGE_WIDTH, PAGE_HEIGHT)

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}