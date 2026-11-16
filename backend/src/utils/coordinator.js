import PDFDocument from 'pdfkit'

// Helper for professional page-budgeted footers across all generated pages
const addFooter = (doc) => {
    const pages = doc.bufferedPageRange()
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i)
        doc.fontSize(8).fillColor('#8fa396')
            .text(
                `CDSConnect · InfoTech CDS Lagos  |  Page ${i + 1} of ${pages.count}`,
                50,
                780,
                { align: 'center', width: 495 }
            )
    }
}

// 1. Pure PDF builder for members list
export const createMembersPdfBuffer = (streamGroups, totalMembersCount) => {
    // Enable bufferPages so we can draw dynamic footers at the end
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

    // Header
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0d1b12')
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
        // Guard check for stream header page fit
        if (doc.y > 700) doc.addPage()

        doc.fillColor('#008751').fontSize(12).font('Helvetica-Bold')
            .text(streamName)
        doc.fontSize(9).fillColor('#8fa396').font('Helvetica')
            .text(`${streamMembers.length} member${streamMembers.length !== 1 ? 's' : ''}`)
        doc.moveDown(0.5)

        const tableTop = doc.y
        doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
        doc.text('S/N', 50, tableTop, { width: 30 })
        doc.text('Full Name', 80, tableTop, { width: 200 })
        doc.text('State Code', 280, tableTop, { width: 120 })
        doc.text('Role', 400, tableTop, { width: 145 })

        doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4)
            .strokeColor('#e8ece9').stroke()

        doc.moveDown(0.8)

        streamMembers.forEach((m, index) => {
            // Prevent orphan/split rows across page boundaries
            if (doc.y > 730) {
                doc.addPage()
                // Re-render compact table header on new page
                const freshTop = doc.y
                doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
                doc.text('S/N', 50, freshTop, { width: 30 })
                doc.text('Full Name', 80, freshTop, { width: 200 })
                doc.text('State Code', 280, freshTop, { width: 120 })
                doc.text('Role', 400, freshTop, { width: 145 })
                doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#e8ece9').stroke()
                doc.moveDown(0.8)
            }

            const y = doc.y

            if (index % 2 === 0) {
                doc.rect(50, y - 3, 495, 16).fillColor('#f8fdf9').fill()
            }

            doc.fillColor('#0d1b12').fontSize(9).font('Helvetica')
            doc.text(`${index + 1}`, 50, y, { width: 30 })
            doc.text(`${m.first_name} ${m.last_name}`, 80, y, { width: 200 })
            doc.text(m.state_code, 280, y, { width: 120 })
            doc.text(m.role?.replace('_', ' ') || 'member', 400, y, { width: 145 })

            doc.moveDown(0.8)
        })

        doc.moveDown()
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e8ece9').stroke()
        doc.moveDown(1.5)
    })

    // Total summary string on final page or appended cleanly
    if (doc.y > 730) doc.addPage()
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#008751')
        .text(`Total Active Members: ${totalMembersCount}`, { align: 'center' })

    // Apply dynamic multi-page footers safely
    addFooter(doc)

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}

// 2. Pure PDF builder for attendance report
export const createAttendancePdfBuffer = (report) => {
    const { meeting, present, absent, totals } = report

    const meetingDateStr = typeof meeting.meeting_date === 'string'
        ? meeting.meeting_date
        : meeting.meeting_date.toISOString().split('T')[0]

    const meetingDate = new Date(`${meetingDateStr}T12:00:00Z`)
    const formattedDate = meetingDate.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    })

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))

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

    const boxY = doc.y
    const boxW = 140

    doc.rect(50, boxY, boxW, 45).fillColor('#e6f4ee').fill()
    doc.fillColor('#008751').fontSize(20).font('Helvetica-Bold')
        .text(totals.present.toString(), 50, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica')
        .text('PRESENT', 50, boxY + 30, { width: boxW, align: 'center' })

    doc.rect(202, boxY, boxW, 45).fillColor('#fff0f0').fill()
    doc.fillColor('#e53e3e').fontSize(20).font('Helvetica-Bold')
        .text(totals.absent.toString(), 202, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica')
        .text('ABSENT', 202, boxY + 30, { width: boxW, align: 'center' })

    doc.rect(354, boxY, boxW, 45).fillColor('#f2f4f7').fill()
    doc.fillColor('#0d1b12').fontSize(20).font('Helvetica-Bold')
        .text(totals.total.toString(), 354, boxY + 6, { width: boxW, align: 'center' })
    doc.fontSize(8).font('Helvetica').fillColor('#8fa396')
        .text('TOTAL', 354, boxY + 30, { width: boxW, align: 'center' })

    doc.y = boxY + 65
    doc.moveDown()

    const drawSection = (title, membersList, color, bgColor) => {
        if (doc.y > 700) doc.addPage()

        doc.fillColor(color).fontSize(11).font('Helvetica-Bold')
            .text(`${title} (${membersList.length})`)
        doc.moveDown(0.5)

        if (membersList.length === 0) {
            doc.fillColor('#8fa396').fontSize(9).font('Helvetica').text('None')
            doc.moveDown(1.5)
            return
        }

        const hY = doc.y
        doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
        doc.text('S/N', 50, hY, { width: 30 })
        doc.text('Full Name', 80, hY, { width: 220 })
        doc.text('State Code', 300, hY, { width: 120 })
        doc.text('Batch', 420, hY, { width: 125 })
        doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#e8ece9').stroke()
        doc.moveDown(0.8)

        membersList.forEach((m, i) => {
            if (doc.y > 730) {
                doc.addPage()
                const freshY = doc.y
                doc.fillColor('#0d1b12').fontSize(9).font('Helvetica-Bold')
                doc.text('S/N', 50, freshY, { width: 30 })
                doc.text('Full Name', 80, freshY, { width: 220 })
                doc.text('State Code', 300, freshY, { width: 120 })
                doc.text('Batch', 420, freshY, { width: 125 })
                doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#e8ece9').stroke()
                doc.moveDown(0.8)
            }

            const y = doc.y

            if (i % 2 === 0) {
                doc.rect(50, y - 3, 495, 16).fillColor(bgColor).fill()
            }

            doc.fillColor('#0d1b12').fontSize(9).font('Helvetica')
            doc.text(`${i + 1}`, 50, y, { width: 30 })
            doc.text(`${m.first_name} ${m.last_name}`, 80, y, { width: 220 })
            doc.text(m.state_code, 300, y, { width: 120 })
            doc.text(m.stream_year ? `${m.stream_year} Batch ${m.stream_batch}` : '—', 420, y, { width: 125 })
            doc.moveDown(0.8)
        })

        doc.moveDown(1.5)
    }

    drawSection('PRESENT', present, '#008751', '#f8fdf9')
    drawSection('ABSENT', absent, '#e53e3e', '#fff8f8')

    // Apply dynamic footer across all document pages
    addFooter(doc)

    doc.end()

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
    })
}