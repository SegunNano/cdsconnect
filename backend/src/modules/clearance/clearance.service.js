import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import pool from '../../config/db'

export const generateClearanceSlip = async (memberId, meetingId) => {

    // 1. Get clearance slip record — must already exist
    const slipResult = await pool.query(
        'SELECT qr_token FROM clearance_slips WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )

    if (slipResult.rows.length === 0) {
        throw { status: 403, message: 'No clearance found for this meeting.' }
    }

    const qrToken = slipResult.rows[0].qr_token

    // 2. Fetch Member and Meeting data in parallel
    const [memberResult, meetingResult] = await Promise.all([
        pool.query(
            `SELECT m.*,
                s.year AS stream_year,
                s.batch AS stream_batch,
                s.stream AS stream_number
            FROM members m
            JOIN streams s ON m.stream_id = s.id
            WHERE m.id = $1`,
            [memberId]
        ),
        pool.query('SELECT * FROM meetings WHERE id = $1', [meetingId])
    ])

    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found.' }
    }
    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found.' }
    }

    const member = memberResult.rows[0]
    const meeting = meetingResult.rows[0]

    // 3. Generate QR code buffer directly
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${qrToken}`
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#008751', light: '#FFFFFF' }
    })

    // 4. Format meeting month/year safely
    const meetingDateStr = typeof meeting.meeting_date === 'string'
        ? meeting.meeting_date
        : meeting.meeting_date.toISOString().split('T')[0]

    const meetingDate = new Date(`${meetingDateStr}T12:00:00Z`)
    const month = meetingDate.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    })

    // 5. Build PDF Document
    const PAGE_WIDTH = 595.28 // A4 width in points
    const PAGE_HEIGHT = 841.89 // A4 height in points
    const MARGIN = 60

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN })
    const buffers = []

    doc.on('data', (chunk) => buffers.push(chunk))

    // Top Accent Bar
    doc
        .rect(0, 0, PAGE_WIDTH, 8)
        .fill('#008751')

    doc.y = 50

    // Header
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('NATIONAL YOUTH SERVICE CORPS', { align: 'center' })

    doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#008751')
        .text('LAGOS STATE SECRETARIAT', { align: 'center' })

    doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4a5e52')
        .text('InfoTech Community Development Service (CDS) Group', { align: 'center' })

    doc.moveDown(1.5)

    // Divider Line
    doc
        .moveTo(MARGIN, doc.y)
        .lineTo(PAGE_WIDTH - MARGIN, doc.y)
        .strokeColor('#d0d8d3')
        .lineWidth(1)
        .stroke()

    doc.moveDown(2)

    // Document Title
    doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('CLEARANCE SLIP', { align: 'center', underline: true })

    doc.moveDown(2)

    // Body Text
    const pronoun = (member.gender || '').toLowerCase() === 'female' ? 'She' : 'He'
    const fullName = `${member.first_name} ${member.last_name}`.toUpperCase()

    doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#0d1b12')
        .text(
            `This is to certify that Corps Member `,
            { align: 'justify', lineGap: 6, continued: true }
        )
        .font('Helvetica-Bold')
        .text(`${fullName}`, { continued: true })
        .font('Helvetica')
        .text(` with State Code Number `, { continued: true })
        .font('Helvetica-Bold')
        .text(`${member.state_code}`, { continued: true })
        .font('Helvetica')
        .text(
            `, assigned to ${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}, is an active member of the InfoTech CDS Group.`,
            { lineGap: 6 }
        )

    doc.moveDown()

    doc
        .font('Helvetica')
        .text(
            `${pronoun} has fulfilled all attendance and financial obligations and is hereby `,
            { align: 'justify', lineGap: 6, continued: true }
        )
        .font('Helvetica-Bold')
        .text(`CLEARED`, { continued: true })
        .font('Helvetica')
        .text(` for the month of `, { continued: true })
        .font('Helvetica-Bold')
        .text(`${month}.`)

    doc.moveDown(4)

    // Signature Block
    const sigY = doc.y
    doc
        .moveTo(MARGIN, sigY)
        .lineTo(MARGIN + 180, sigY)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke()

    doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0d1b12')
        .text("CDS Executive / Coordinator Signature", MARGIN, sigY + 6)

    // QR Code Placement (Centered)
    const qrSize = 110
    const qrX = (PAGE_WIDTH - qrSize) / 2
    const qrY = sigY + 50

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

    doc.y = qrY + qrSize + 10

    doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#555555')
        .text(
            'Scan QR code to verify validity. Any alteration renders this slip void.',
            { align: 'center' }
        )

    // Footer
    doc
        .fontSize(8)
        .fillColor('#8fa396')
        .text(
            `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · CDSConnect System · Lagos State NYSC`,
            MARGIN,
            PAGE_HEIGHT - 40,
            { align: 'center', width: PAGE_WIDTH - (MARGIN * 2) }
        )

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve({
            buffer: Buffer.concat(buffers),
            member,
            month
        }))
        doc.on('error', reject)
    })
}



export const verifyClearanceSlip = async (qrToken) => {
    const result = await pool.query(
        `SELECT cs.*,
            m.first_name, m.last_name, m.state_code, m.gender,
            mt.title AS meeting_title, mt.meeting_date
        FROM clearance_slips cs
        JOIN members m ON cs.member_id = m.id
        JOIN meetings mt ON cs.meeting_id = mt.id
        WHERE cs.qr_token = $1`,
        [qrToken]
    )

    if (result.rows.length === 0) {
        throw { status: 404, message: 'Invalid or tampered clearance slip.' }
    }

    return {
        valid: true,
        data: result.rows[0]
    }
}

export const getMyClearanceSlips = async (memberId) => {
    const result = await pool.query(
        `SELECT cs.*, m.title AS meeting_title, m.meeting_date
        FROM clearance_slips cs
        JOIN meetings m ON cs.meeting_id = m.id
        WHERE cs.member_id = $1
        ORDER BY cs.generated_at DESC`,
        [memberId]
    )
    return result.rows
}