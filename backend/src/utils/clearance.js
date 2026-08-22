import pool from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification } from '../modules/notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../constants.js'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'

export const issueClearance = async (memberId, meetingId) => {
    // Check if already exists
    const existing = await pool.query(
        'SELECT id FROM clearance_slips WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )

    if (existing.rows.length > 0) return // Already issued

    const qrToken = uuidv4()

    await pool.query(
        `INSERT INTO clearance_slips (member_id, meeting_id, qr_token)
        VALUES ($1, $2, $3)`,
        [memberId, meetingId, qrToken]
    )

    // Get meeting title for notification
    const meetingResult = await pool.query(
        'SELECT title FROM meetings WHERE id = $1',
        [meetingId]
    )

    await createNotification(
        memberId,
        'Clearance Ready 🎉',
        `Your clearance slip for ${meetingResult.rows[0].title} is ready to download.`,
        NOTIFICATION_TYPES.CLEARANCE_READY
    )
}

export const buildClearanceSlipPdf = async ({ member, meetingDateStr, qrToken }) => {
    // 1. Safe Date Parser
    const parseDateSafely = (inputDate) => {
        if (!inputDate) return new Date()
        if (inputDate instanceof Date) return inputDate
        return new Date(`${inputDate}T12:00:00Z`)
    }

    const meetingDate = parseDateSafely(meetingDateStr)
    const month = meetingDate.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    })

    // 2. Setup Canvas
    const CANVAS_WIDTH = 1240
    const CANVAS_HEIGHT = 1754
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const ctx = canvas.getContext('2d')

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Top Accent Line
    ctx.fillStyle = '#008751'
    ctx.fillRect(0, 0, CANVAS_WIDTH, 16)

    // Header
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 32px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('NATIONAL YOUTH SERVICE CORPS', CANVAS_WIDTH / 2, 120)

    ctx.fillStyle = '#008751'
    ctx.font = 'bold 22px Helvetica, Arial, sans-serif'
    ctx.fillText('LAGOS STATE SECRETARIAT', CANVAS_WIDTH / 2, 160)

    ctx.fillStyle = '#4a5e52'
    ctx.font = '20px Helvetica, Arial, sans-serif'
    ctx.fillText('InfoTech Community Development Service (CDS) Group', CANVAS_WIDTH / 2, 195)

    // Divider
    ctx.strokeStyle = '#d0d8d3'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(120, 230)
    ctx.lineTo(CANVAS_WIDTH - 120, 230)
    ctx.stroke()

    // Title
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 26px Helvetica, Arial, sans-serif'
    ctx.fillText('CLEARANCE SLIP', CANVAS_WIDTH / 2, 290)

    // Body Text Formatting
    const pronoun = (member.gender || '').toLowerCase() === 'female' ? 'She' : 'He'
    const fullName = `${member.first_name} ${member.last_name}`.toUpperCase()

    ctx.fillStyle = '#0d1b12'
    ctx.font = '22px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'left'

    const line1 = `This is to certify that Corps Member ${fullName} (${member.state_code}),`
    const line2 = `assigned to ${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}, is an active member of the InfoTech CDS Group.`
    const line3 = `${pronoun} has fulfilled all obligations and is hereby CLEARED for the month of ${month}.`

    ctx.fillText(line1, 120, 370)
    ctx.fillText(line2, 120, 410)
    ctx.fillText(line3, 120, 480)

    // Signature Line
    ctx.strokeStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(120, 620)
    ctx.lineTo(480, 620)
    ctx.stroke()

    ctx.font = 'bold 18px Helvetica, Arial, sans-serif'
    ctx.fillText('CDS Executive / Coordinator Signature', 120, 650)

    // Footer
    ctx.fillStyle = '#8fa396'
    ctx.font = '16px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
        `Generated on ${new Date().toLocaleDateString('en-GB')} · CDSConnect System · Lagos State NYSC`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 80
    )

    const flattenedImageBuffer = canvas.toBuffer('image/png')

    // 3. Generate QR Code
    const verifyUrl = `${process.env.FRONTEND_URL || 'https://cdsconnect.app'}/verify/${qrToken}`
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#008751', light: '#FFFFFF' }
    })

    // 4. Assemble PDF via PDFKit
    const PAGE_WIDTH = 595.28
    const PAGE_HEIGHT = 841.89
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const buffers = []

    doc.on('data', (chunk) => buffers.push(chunk))

    doc.image(flattenedImageBuffer, 0, 0, { width: PAGE_WIDTH, height: PAGE_HEIGHT })

    const qrSize = 110
    const qrX = (PAGE_WIDTH - qrSize) / 2
    const qrY = 360

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

    doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#555555')
        .text(
            'Scan QR code to verify validity. Any alteration renders this slip void.',
            0,
            qrY + qrSize + 10,
            { align: 'center', width: PAGE_WIDTH }
        )

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () =>
            resolve({
                buffer: Buffer.concat(buffers),
                member,
                month
            })
        )
        doc.on('error', reject)
    })
}