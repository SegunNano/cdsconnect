import pool from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification } from '../modules/notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../constants.js'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nyscLogoPath = path.join(__dirname, '../assets/logos/nysc-logo.png')
const infoTechLogoPath = path.join(__dirname, '../assets/logos/infotech-logo.png')
const coordinatorSignaturePath = path.join(__dirname, '../assets/signatures/coordinator-sig.png')

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

// export const buildClearanceSlipPdf = async ({ member, meetingDateStr, qrToken }) => {
//     // 1. Safe Date Parser
//     const parseDateSafely = (inputDate) => {
//         if (!inputDate) return new Date()
//         if (inputDate instanceof Date) return inputDate
//         return new Date(`${inputDate}T12:00:00Z`)
//     }

//     const meetingDate = parseDateSafely(meetingDateStr)
//     const month = meetingDate.toLocaleString('en-US', {
//         month: 'long',
//         year: 'numeric',
//         timeZone: 'UTC'
//     })

//     // 2. Setup Canvas
//     const CANVAS_WIDTH = 1240
//     const CANVAS_HEIGHT = 1754
//     const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
//     const ctx = canvas.getContext('2d')

//     // White background
//     ctx.fillStyle = '#FFFFFF'
//     ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

//     // Top Accent Line
//     ctx.fillStyle = '#008751'
//     ctx.fillRect(0, 0, CANVAS_WIDTH, 16)

//     // Header
//     ctx.fillStyle = '#000000'
//     ctx.font = 'bold 32px Helvetica, Arial, sans-serif'
//     ctx.textAlign = 'center'
//     ctx.fillText('NATIONAL YOUTH SERVICE CORPS', CANVAS_WIDTH / 2, 120)

//     ctx.fillStyle = '#008751'
//     ctx.font = 'bold 22px Helvetica, Arial, sans-serif'
//     ctx.fillText('LAGOS STATE SECRETARIAT', CANVAS_WIDTH / 2, 160)

//     ctx.fillStyle = '#4a5e52'
//     ctx.font = '20px Helvetica, Arial, sans-serif'
//     ctx.fillText('InfoTech Community Development Service (CDS) Group', CANVAS_WIDTH / 2, 195)

//     // Divider
//     ctx.strokeStyle = '#d0d8d3'
//     ctx.lineWidth = 2
//     ctx.beginPath()
//     ctx.moveTo(120, 230)
//     ctx.lineTo(CANVAS_WIDTH - 120, 230)
//     ctx.stroke()

//     // Title
//     ctx.fillStyle = '#000000'
//     ctx.font = 'bold 26px Helvetica, Arial, sans-serif'
//     ctx.fillText('CLEARANCE SLIP', CANVAS_WIDTH / 2, 290)

//     // Body Text Formatting
//     const pronoun = (member.gender || '').toLowerCase() === 'female' ? 'She' : 'He'
//     const fullName = `${member.first_name} ${member.last_name}`.toUpperCase()

//     ctx.fillStyle = '#0d1b12'
//     ctx.font = '22px Helvetica, Arial, sans-serif'
//     ctx.textAlign = 'left'

//     const line1 = `This is to certify that Corps Member ${fullName} (${member.state_code}),`
//     const line2 = `assigned to ${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}, is an active member of the InfoTech CDS Group.`
//     const line3 = `${pronoun} has fulfilled all obligations and is hereby CLEARED for the month of ${month}.`

//     ctx.fillText(line1, 120, 370)
//     ctx.fillText(line2, 120, 410)
//     ctx.fillText(line3, 120, 480)

//     // Signature Line
//     ctx.strokeStyle = '#000000'
//     ctx.beginPath()
//     ctx.moveTo(120, 620)
//     ctx.lineTo(480, 620)
//     ctx.stroke()

//     ctx.font = 'bold 18px Helvetica, Arial, sans-serif'
//     ctx.fillText('CDS Executive / Coordinator Signature', 120, 650)

//     // Footer
//     ctx.fillStyle = '#8fa396'
//     ctx.font = '16px Helvetica, Arial, sans-serif'
//     ctx.textAlign = 'center'
//     ctx.fillText(
//         `Generated on ${new Date().toLocaleDateString('en-GB')} · CDSConnect System · Lagos State NYSC`,
//         CANVAS_WIDTH / 2,
//         CANVAS_HEIGHT - 80
//     )

//     const flattenedImageBuffer = canvas.toBuffer('image/png')

//     // 3. Generate QR Code
//     const verifyUrl = `${process.env.FRONTEND_URL || 'https://cdsconnect.app'}/verify/${qrToken}`
//     const qrBuffer = await QRCode.toBuffer(verifyUrl, {
//         width: 140,
//         margin: 1,
//         color: { dark: '#008751', light: '#FFFFFF' }
//     })

//     // 4. Assemble PDF via PDFKit
//     const PAGE_WIDTH = 595.28
//     const PAGE_HEIGHT = 841.89
//     const doc = new PDFDocument({ size: 'A4', margin: 0 })
//     const buffers = []

//     doc.on('data', (chunk) => buffers.push(chunk))

//     doc.image(flattenedImageBuffer, 0, 0, { width: PAGE_WIDTH, height: PAGE_HEIGHT })

//     const qrSize = 110
//     const qrX = (PAGE_WIDTH - qrSize) / 2
//     const qrY = 360

//     doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

//     doc.fontSize(8)
//         .font('Helvetica')
//         .fillColor('#555555')
//         .text(
//             'Scan QR code to verify validity. Any alteration renders this slip void.',
//             0,
//             qrY + qrSize + 10,
//             { align: 'center', width: PAGE_WIDTH }
//         )

//     doc.end()

//     return new Promise((resolve, reject) => {
//         doc.on('end', () =>
//             resolve({
//                 buffer: Buffer.concat(buffers),
//                 member,
//                 month
//             })
//         )
//         doc.on('error', reject)
//     })
// }




/**
 * Generates an official circular stamp overlay with curved text and embedded date
 */
const generateStampBuffer = (formattedDateStr) => {
    const size = 320
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    const centerX = size / 2
    const centerY = size / 2
    const blue = '#003399'

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((-10 * Math.PI) / 180) // Slight rotation for physical stamp effect

    // 1. Outer & Inner Rings
    ctx.beginPath()
    ctx.arc(0, 0, 140, 0, Math.PI * 2)
    ctx.strokeStyle = blue
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, 0, 124, 0, Math.PI * 2)
    ctx.lineWidth = 2
    ctx.stroke()

    // Inner bounding ring for center text
    ctx.beginPath()
    ctx.arc(0, 0, 75, 0, Math.PI * 2)
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = blue
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 2. Helper to draw curved text along arc radius
    const drawCurvedText = (text, radius, startAngle, endAngle, align = 'top') => {
        const numChars = text.length
        const angleStep = (endAngle - startAngle) / (numChars - 1)

        ctx.font = 'bold 16px Helvetica, Arial, sans-serif'

        for (let i = 0; i < numChars; i++) {
            const char = text[i]
            const angle = startAngle + i * angleStep
            ctx.save()
            ctx.rotate(angle)
            ctx.translate(0, align === 'top' ? -radius : radius)
            if (align === 'bottom') ctx.rotate(Math.PI)
            ctx.fillText(char, 0, 0)
            ctx.restore()
        }
    }

    // Top Arc Text: INFOTECH CDS GROUP (fits cleanly inside outer/inner ring gap)
    drawCurvedText('INFOTECH CDS GROUP', 98, -Math.PI / 2.8, Math.PI / 2.8, 'top')

    // Bottom Arc Text: NYSC LAGOS
    drawCurvedText('NYSC LAGOS STATE', 98, -Math.PI / 3, Math.PI / 3, 'bottom')

    // 3. Center Stamp Text (Status & Tamper-proof Date)
    ctx.font = 'bold 22px Helvetica, Arial, sans-serif'
    ctx.fillText('APPROVED', 0, -22)

    // Divider Line inside stamp center
    ctx.beginPath()
    ctx.moveTo(-50, -5)
    ctx.lineTo(50, -5)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = blue
    ctx.stroke()

    ctx.font = 'bold 13px Helvetica, Arial, sans-serif'
    ctx.fillText('DATE / CLEARED', 0, 12)

    // Baked Date inside Stamp
    ctx.font = '14px Helvetica, Arial, sans-serif'
    ctx.fillText(formattedDateStr, 0, 32)

    ctx.restore()
    return canvas.toBuffer('image/png')
}

export const buildClearanceSlipPdf = async ({
    member,
    meetingDateStr,
    qrToken
}) => {
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
    const dateFormatted = meetingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    })

    // 2. Setup PDFKit A4 Document
    const PAGE_WIDTH = 595.28
    const PAGE_HEIGHT = 841.89
    const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
            Title: `Clearance Slip - ${member.state_code}`,
            Author: 'CDSConnect System'
        }
    })

    const buffers = []
    doc.on('data', (chunk) => buffers.push(chunk))

// -------------------------------------------------------------
    // LAYER 1: Watermark Grid with Proper String Spacing
    // -------------------------------------------------------------
    doc.save()
    doc.rotate(-25, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] })
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#008751').fillOpacity(0.045)

    // Added trailing spaces and a dot separator so "LAGOS" doesn't hit "CDS"
    const watermarkText = 'CDSCONNECT • NYSC LAGOS   •   '
    const stepX = 180
    const stepY = 75

    for (let y = -200; y < PAGE_HEIGHT + 200; y += stepY) {
        for (let x = -200; x < PAGE_WIDTH + 200; x += stepX) {
            doc.text(watermarkText, x, y, { lineBreak: false })
        }
    }
    doc.restore()

    // -------------------------------------------------------------
    // LAYER 2: Header Accents & Logos
    // -------------------------------------------------------------
    doc.rect(0, 0, PAGE_WIDTH, 12).fill('#008751')

    const logoY = 32
    const nyscLogoSize = 75     // Enlarged NYSC Logo
    const infoTechLogoSize = 60 // Balanced secondary logo

    if (nyscLogoPath && fs.existsSync(nyscLogoPath)) {
        doc.image(nyscLogoPath, 45, logoY, { width: nyscLogoSize })
    }
    if (infoTechLogoPath && fs.existsSync(infoTechLogoPath)) {
        doc.image(infoTechLogoPath, PAGE_WIDTH - 45 - infoTechLogoSize, logoY + 7, { width: infoTechLogoSize })
    }

    // Header Text
    doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(19)
        .text('NATIONAL YOUTH SERVICE CORPS', 0, 42, { align: 'center', width: PAGE_WIDTH })

    doc.fillColor('#008751')
        .fontSize(13)
        .text('LAGOS STATE SECRETARIAT', 0, 67, { align: 'center', width: PAGE_WIDTH })

    doc.fillColor('#4a5e52')
        .font('Helvetica')
        .fontSize(10.5)
        .text('InfoTech Community Development Service (CDS) Group', 0, 85, { align: 'center', width: PAGE_WIDTH })

    // Divider Line
    doc.moveTo(45, 118)
        .lineTo(PAGE_WIDTH - 45, 118)
        .lineWidth(1)
        .strokeColor('#d0d8d3')
        .stroke()

    // -------------------------------------------------------------
    // LAYER 3: Title & Clearance Text Body
    // -------------------------------------------------------------
    doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('OFFICIAL CLEARANCE SLIP', 0, 145, { align: 'center', width: PAGE_WIDTH })

    const fullName = `${member.first_name} ${member.last_name}`.toUpperCase()
    const pronoun = (member.gender || '').toLowerCase() === 'female' ? 'She' : 'He'

    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#0d1b12')
        .lineGap(8)

    const contentY = 195
    const textWidth = PAGE_WIDTH - 90

    doc.text('This is to certify that Corps Member ', 45, contentY, { continued: true, width: textWidth })
        .font('Helvetica-Bold').text(`${fullName} `, { continued: true })
        .font('Helvetica').text('(State Code: ', { continued: true })
        .font('Helvetica-Bold').text(`${member.state_code}`, { continued: true })
        .font('Helvetica').text('), assigned to ', { continued: true })
        .font('Helvetica-Bold').text(`${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`, { continued: true })
        .font('Helvetica').text(', is a duly registered and active member of the InfoTech CDS Group.')

    doc.moveDown(0.8)
    doc.text(`${pronoun} has satisfactorily fulfilled all administrative obligations, attendance requirements, and monthly dues, and is hereby `, { continued: true, width: textWidth })
        .font('Helvetica-Bold').text('CLEARED ', { continued: true })
        .font('Helvetica').text('for the month of ', { continued: true })
        .font('Helvetica-Bold').text(`${month}.`)


    // -------------------------------------------------------------
    // LAYER 4: Signature, Embedded Stamp Overlay & Date
    // -------------------------------------------------------------
    const sigY = 400

    // 1. Signature Image
    if (coordinatorSignaturePath && fs.existsSync(coordinatorSignaturePath)) {
        doc.image(coordinatorSignaturePath, 45, sigY - 65, { height: 75 })
    }

    // 2. Signature Line & Details
    doc.moveTo(45, sigY)
        .lineTo(240, sigY)
        .lineWidth(1.2)
        .strokeColor('#000000')
        .stroke()

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('CDS Coordinator', 45, sigY + 6)
    doc.font('Helvetica').fontSize(9).fillColor('#4a5e52').text(`Date: ${dateFormatted}`, 45, sigY + 22)

    // 3. Canvas Stamp (Bakes date & overlays both line and date text)
    const stampBuffer = generateStampBuffer(dateFormatted)
    
    // Positioned over the right side of signature line and lower date label
    doc.image(stampBuffer, 80, sigY - 50, { width: 135, height: 135 })

    // -------------------------------------------------------------
    // LAYER 5: Verification QR Code & Footer
    // -------------------------------------------------------------
    const verifyUrl = `${process.env.FRONTEND_URL || 'https://cdsconnect.app'}/verify/${qrToken}`
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#008751', light: '#FFFFFF' }
    })

    const qrSize = 90
    const qrX = (PAGE_WIDTH - qrSize) / 2
    const qrY = 490

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

    doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#555555')
        .text(
            'Scan QR code to verify authenticity online. Any alteration renders this slip invalid.',
            0,
            qrY + qrSize + 8,
            { align: 'center', width: PAGE_WIDTH }
        )


    doc.fontSize(7.5)
   .fillColor('#8fa396')
   .text(
       `Generated on ${new Date().toLocaleDateString('en-GB')} · CDSConnect Automated System · Lagos State NYSC Secretariat`,
       0,
       PAGE_HEIGHT - 50, // Moved up inside the 40pt margin
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