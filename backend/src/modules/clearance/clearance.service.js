import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

export const generateClearanceSlip = async (memberId, meetingId) => {
    // Get member with stream
    const memberResult = await pool.query(
        `SELECT m.*, s.year, s.batch, s.stream
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.id = $1`,
        [memberId]
    )

    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found.' }
    }

    const member = memberResult.rows[0]

    // Get meeting
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )

    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found.' }
    }

    const meeting = meetingResult.rows[0]

    // Check member is present for this meeting
    const attendanceResult = await pool.query(
        `SELECT * FROM attendance 
        WHERE member_id = $1 AND meeting_id = $2`,
        [memberId, meetingId]
    )

    if (attendanceResult.rows.length === 0) {
        throw { status: 403, message: 'You are not cleared for this meeting.' }
    }

    const attendance = attendanceResult.rows[0]

    // Must be signed out to get clearance
    if (!attendance.signed_out_at && !attendance.excuse_id && !attendance.marked_present_by) {
        throw { status: 403, message: 'You have not been signed out yet.' }
    }

    // Get or create clearance slip record
    let slipResult = await pool.query(
        'SELECT * FROM clearance_slips WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )

    let qrToken
    if (slipResult.rows.length === 0) {
        qrToken = uuidv4()
        await pool.query(
            `INSERT INTO clearance_slips (member_id, meeting_id, qr_token)
            VALUES ($1, $2, $3)`,
            [memberId, meetingId, qrToken]
        )
    } else {
        qrToken = slipResult.rows[0].qr_token
    }

    // Generate QR code
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${qrToken}`
    const qrDataURL = await QRCode.toDataURL(verifyUrl)
    const qrImage = qrDataURL.split(',')[1]

    // Get month from meeting date
    const meetingDate = new Date(meeting.meeting_date)
    const month = meetingDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    })

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 70 })
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))

    // Header
    doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('NYSC LAGOS STATE', { align: 'center' })

    doc
        .fontSize(11)
        .font('Helvetica')
        .text('InfoTech Community Development Service Group', { align: 'center' })

    doc.moveDown(2)

    // Body
    const pronoun = member.gender === 'male' ? 'He' : 'She'
    const fullName = `${member.first_name} ${member.last_name}`

    doc
        .fontSize(12)
        .font('Helvetica')
        .text(
            `This is to certify that corps member ${fullName} with code ${member.state_code}, is a member of InfoTech CDS group.`,
            { align: 'justify', lineGap: 6 }
        )

    doc.moveDown()

    doc
        .text(
            `${pronoun} is hereby cleared for the month of ${month}.`,
            { align: 'justify', lineGap: 6 }
        )

    doc.moveDown()
    doc.text('Thank you.', { align: 'justify' })

    doc.moveDown(3)

    // Signature line
    doc
        .moveTo(70, doc.y)
        .lineTo(250, doc.y)
        .stroke()

    doc
        .fontSize(9)
        .font('Helvetica')
        .text("Coordinator's Signature", 70)

    doc.moveDown(2)

    // QR code
    doc
        .fontSize(10)
        .font('Helvetica')
        .text(
            'Scan the QR code below to verify the authenticity of this slip. Any alteration to this document renders it invalid.',
            { align: 'center', lineGap: 4 }
        )

    doc.moveDown()

    doc.image(Buffer.from(qrImage, 'base64'), {
        width: 100,
        height: 100,
        align: 'center'
    })

    doc.moveDown(2)

    // Footer
    doc
        .fontSize(8)
        .fillColor('grey')
        .text(
            `Generated on ${new Date().toLocaleString()} · CDSConnect · Lagos NYSC`,
            { align: 'center' }
        )

    doc.end()

    return new Promise((resolve) => {
        doc.on('end', () => resolve({
            buffer: Buffer.concat(buffers),
            member,
            month
        }))
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