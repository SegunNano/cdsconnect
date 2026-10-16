import PDFDocument from 'pdfkit'
export const getCoordinatorOverview = async () => {
    // Total active corps members
    const membersResult = await pool.query(
        `SELECT COUNT(*) AS total
        FROM members
        WHERE is_active = true
        AND member_type = 'corps_member'`
    )

    // Active streams with member counts
    const streamsResult = await pool.query(
        `SELECT 
            s.id,
            s.year,
            s.batch,
            s.stream,
            s.callup_date,
            s.service_end,
            s.certificate_unlocked,
            COUNT(m.id) AS member_count
        FROM streams s
        LEFT JOIN members m 
            ON m.stream_id = s.id 
            AND m.is_active = true
            AND m.member_type = 'corps_member'
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY s.callup_date DESC`
    )

    // Total meetings
    const meetingsResult = await pool.query(
        `SELECT COUNT(*) AS total FROM meetings
        WHERE sign_in_close < NOW()`
    )

    return {
        total_members: parseInt(membersResult.rows[0].total),
        total_meetings: parseInt(meetingsResult.rows[0].total),
        active_streams: streamsResult.rows
    }
}

export const getCoordinatorMembers = async () => {
    const result = await pool.query(
        `SELECT 
            m.id,
            m.first_name,
            m.last_name,
            m.state_code,
            m.role,
            m.gender,
            m.breakout_session,
            m.token_balance,
            m.reinstatement_count,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.is_active = true
        AND m.member_type = 'corps_member'
        AND s.is_active = true
        ORDER BY s.callup_date DESC, m.last_name ASC`
    )
    return result.rows
}

export const getMeetingAttendanceReport = async (meetingId) => {
    // Get meeting info
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )
    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }
    const meeting = meetingResult.rows[0]

    // Get ALL active members for that meeting's date
    // Only members who were registered before or on meeting date
    const allMembersResult = await pool.query(
        `SELECT 
            m.id, m.first_name, m.last_name,
            m.state_code, m.role, m.gender,
            s.year AS stream_year,
            s.batch AS stream_batch,
            s.stream AS stream_number
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.is_active = true
        AND m.member_type = 'corps_member'
        AND m.created_at::DATE <= $1
        ORDER BY m.last_name ASC`,
        [meeting.meeting_date]
    )

    const allMembers = allMembersResult.rows

    // Get attendance records for this meeting
    const attendanceResult = await pool.query(
        `SELECT 
            a.member_id,
            a.signed_in_at,
            a.signed_out_at,
            a.is_late,
            a.marked_present_by,
            a.sequence_number,
            er.status AS excuse_status
        FROM attendance a
        LEFT JOIN excuse_requests er 
            ON er.meeting_id = a.meeting_id 
            AND er.member_id = a.member_id
        WHERE a.meeting_id = $1`,
        [meetingId]
    )

    const attendanceMap = {}
    attendanceResult.rows.forEach(a => {
        attendanceMap[a.member_id] = a
    })

    // Get approved excuses with no attendance record
    const excuseResult = await pool.query(
        `SELECT member_id FROM excuse_requests
        WHERE meeting_id = $1
        AND status IN ('approved', 'approved_not_needed')`,
        [meetingId]
    )
    const excusedIds = new Set(excuseResult.rows.map(e => e.member_id))

    // Categorise
    const present = []
    const excused = []
    const absent = []

    allMembers.forEach(member => {
        const record = attendanceMap[member.id]
        if (record?.signed_out_at || record?.marked_present_by) {
            present.push({ ...member, ...record })
        } else if (excusedIds.has(member.id) || record?.excuse_id) {
            excused.push(member)
        } else {
            absent.push(member)
        }
    })

    return {
        meeting,
        present,
        excused,
        absent,
        totals: {
            total: allMembers.length,
            present: present.length,
            excused: excused.length,
            absent: absent.length
        }
    }
}




export const generateMembersPdf = async () => {
    const members = await getCoordinatorMembers()

    // Group by stream
    const streamGroups = {}
    members.forEach(m => {
        const key = `${m.stream_year} Batch ${m.stream_batch} Stream ${m.stream_number}`
        if (!streamGroups[key]) streamGroups[key] = []
        streamGroups[key].push(m)
    })

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
        .text('NYSC LAGOS STATE', { align: 'center' })
    doc.fontSize(11).font('Helvetica')
        .text('InfoTech CDS Group — Active Members List', { align: 'center' })
    doc.fontSize(9).fillColor('#8fa396')
        .text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })

    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d0d8d3').stroke()
    doc.moveDown()

    // Per stream
    Object.entries(streamGroups).forEach(([streamName, streamMembers]) => {
        // Stream heading
        doc.fillColor('#008751').fontSize(12).font('Helvetica-Bold')
            .text(streamName)
        doc.fontSize(9).fillColor('#8fa396').font('Helvetica')
            .text(`${streamMembers.length} member${streamMembers.length !== 1 ? 's' : ''}`)
        doc.moveDown(0.5)

        // Table header
        const tableTop = doc.y
        doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
        doc.text('S/N', 50, tableTop, { width: 30 })
        doc.text('Full Name', 80, tableTop, { width: 200 })
        doc.text('State Code', 280, tableTop, { width: 120 })
        doc.text('Role', 400, tableTop, { width: 145 })

        doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4)
            .strokeColor('#e8ece9').stroke()

        doc.moveDown(0.8)

        // Members
        streamMembers.forEach((m, index) => {
            const y = doc.y
            doc.fontSize(9).font('Helvetica').fillColor('#0d1b12')
            doc.text(`${index + 1}`, 50, y, { width: 30 })
            doc.text(`${m.first_name} ${m.last_name}`, 80, y, { width: 200 })
            doc.text(m.state_code, 280, y, { width: 120 })
            doc.text(m.role?.replace('_', ' ') || 'member', 400, y, { width: 145 })

            // Alternating row background
            if (index % 2 === 0) {
                doc.rect(50, y - 3, 495, 16)
                    .fillColor('#f8fdf9').fill()
                // Re-draw text over background
                doc.fillColor('#0d1b12')
                doc.text(`${index + 1}`, 50, y, { width: 30 })
                doc.text(`${m.first_name} ${m.last_name}`, 80, y, { width: 200 })
                doc.text(m.state_code, 280, y, { width: 120 })
                doc.text(m.role?.replace('_', ' ') || 'member', 400, y, { width: 145 })
            }

            doc.moveDown(0.8)
        })

        doc.moveDown()
        doc.moveTo(50, doc.y).lineTo(545, doc.y)
            .strokeColor('#e8ece9').stroke()
        doc.moveDown()

        // Page break if needed
        if (doc.y > 700) doc.addPage()
    })

    // Footer
    doc.fontSize(8).fillColor('#8fa396')
        .text(
            `CDSConnect · InfoTech CDS Lagos · Total: ${members.length} active members`,
            50, 780, { align: 'center', width: 495 }
        )

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}

export const generateAttendancePdf = async (meetingId) => {
    const report = await getMeetingAttendanceReport(meetingId)
    const { meeting, present, absent, totals } = report

    const meetingDateStr = typeof meeting.meeting_date === 'string'
        ? meeting.meeting_date
        : meeting.meeting_date.toISOString().split('T')[0]

    const meetingDate = new Date(`${meetingDateStr}T12:00:00Z`)
    const formattedDate = meetingDate.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    })

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

    // Header
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
        .text('NYSC LAGOS STATE', { align: 'center' })
    doc.fontSize(11).font('Helvetica')
        .text('InfoTech CDS Group — Attendance Report', { align: 'center' })
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#008751')
        .text(meeting.title, { align: 'center' })
    doc.fontSize(9).font('Helvetica').fillColor('#8fa396')
        .text(formattedDate, { align: 'center' })

    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#d0d8d3').stroke()
    doc.moveDown()

    // Summary boxes
    const boxY = doc.y
    const boxW = 140

    // Present box
    doc.rect(50, boxY, boxW, 45).fillColor('#e6f4ee').fill()
    doc.fillColor('#008751').fontSize(20).font('Helvetica-Bold')
        .text(totals.present.toString(), 50, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica')
        .text('PRESENT', 50, boxY + 30, { width: boxW, align: 'center' })

    // Absent box
    doc.rect(202, boxY, boxW, 45).fillColor('#fff0f0').fill()
    doc.fillColor('#e53e3e').fontSize(20).font('Helvetica-Bold')
        .text(totals.absent.toString(), 202, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica')
        .text('ABSENT', 202, boxY + 30, { width: boxW, align: 'center' })

    // Total box
    doc.rect(354, boxY, boxW, 45).fillColor('#f2f4f7').fill()
    doc.fillColor('#0d1b12').fontSize(20).font('Helvetica-Bold')
        .text(totals.total.toString(), 354, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica').fillColor('#8fa396')
        .text('TOTAL', 354, boxY + 30, { width: boxW, align: 'center' })

    doc.y = boxY + 60
    doc.moveDown()

    // PRESENT section
    const drawSection = (title, membersList, color, bgColor) => {
        doc.fillColor(color).fontSize(11).font('Helvetica-Bold')
            .text(`${title} (${membersList.length})`)
        doc.moveDown(0.5)

        if (membersList.length === 0) {
            doc.fillColor('#8fa396').fontSize(9).font('Helvetica')
                .text('None')
            doc.moveDown()
            return
        }

        // Table header
        const hY = doc.y
        doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
        doc.text('S/N', 50, hY, { width: 30 })
        doc.text('Full Name', 80, hY, { width: 220 })
        doc.text('State Code', 300, hY, { width: 120 })
        doc.text('Batch', 420, hY, { width: 125 })
        doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4)
            .strokeColor('#e8ece9').stroke()
        doc.moveDown(0.8)

        membersList.forEach((m, i) => {
            if (doc.y > 700) doc.addPage()
            const y = doc.y

            if (i % 2 === 0) {
                doc.rect(50, y - 3, 495, 16).fillColor(bgColor).fill()
            }

            doc.fillColor('#0d1b12').fontSize(9).font('Helvetica')
            doc.text(`${i + 1}`, 50, y, { width: 30 })
            doc.text(`${m.first_name} ${m.last_name}`, 80, y, { width: 220 })
            doc.text(m.state_code, 300, y, { width: 120 })
            doc.text(
                m.stream_year
                    ? `${m.stream_year} Batch ${m.stream_batch}`
                    : '—',
                420, y, { width: 125 }
            )
            doc.moveDown(0.8)
        })

        doc.moveDown()
        if (doc.y > 700) doc.addPage()
    }

    drawSection('PRESENT', present, '#008751', '#f8fdf9')
    drawSection('ABSENT', absent, '#e53e3e', '#fff8f8')

    // Footer
    doc.fontSize(8).fillColor('#8fa396')
        .text(
            `CDSConnect · InfoTech CDS Lagos · Generated ${new Date().toLocaleDateString('en-GB')}`,
            50, 780, { align: 'center', width: 495 }
        )

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}