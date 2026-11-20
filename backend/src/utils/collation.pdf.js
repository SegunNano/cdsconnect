import PDFDocument from 'pdfkit'
const pro = 'Public Relations Officer'
const POSITION = {
    president: 'President', vice_president: 'Vice President', secretary: 'General Secretary',
    treasurer: 'Treasurer', financial_secretary: 'Financial Secretary',
    pro1: pro, pro2: pro,  welfare: 'Welfare Officer'
}

const COLS = [   // [title, x, width]
    ['S/N', 50, 28], ['Full name', 80, 170], ['State code', 252, 92],
    ['Position', 346, 106], ['Certs', 454, 34], ['Paid', 490, 55]
]

const shortDate = (value) => {
    const d = new Date(String(value || '').replace(' ', 'T'))
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
const plural = (n, word) => `${n} ${word}${n !== 1 ? 's' : ''}`

export const generateCollationPdf = (stream) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const members = stream.members
    const excos = members.filter(m => m.is_exco).length
    const batch = `${stream.stream_year} Batch ${stream.stream_batch} Stream ${stream.stream_number}`

    doc.font('Helvetica-Bold').fontSize(15).fillColor('#000000')
        .text('InfoTech CDS Group, Lagos State', { align: 'center' })
    doc.font('Helvetica').fontSize(11)
        .text('Members who have paid for certificates', { align: 'center' })
    doc.moveDown(0.3).font('Helvetica-Bold').fillColor('#008751').text(batch, { align: 'center' })
    doc.font('Helvetica').fontSize(9).fillColor('#555555').text(
        `${plural(members.length, 'member')} paid · ${plural(members.length, 'membership certificate')} · ` +
        `${plural(excos, 'certificate')} of excellence · Generated ${new Date().toLocaleDateString('en-GB')}`,
        { align: 'center' })

    const drawHeader = (y) => {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#0d1b12')
        COLS.forEach(([title, x, w]) => doc.text(title, x, y, { width: w, lineBreak: false }))
        doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor('#cccccc').stroke()
        return y + 20
    }

    let y = drawHeader(doc.y + 14)
    members.forEach((m, i) => {
        if (y > 760) { doc.addPage(); y = drawHeader(50) }
        const cells = [
            String(i + 1),
            `${m.first_name} ${m.last_name}`,
            m.state_code,
            m.is_exco ? (POSITION[m.role] || m.role.replace(/_/g, ' ')) : 'Member',
            m.is_exco ? '2' : '1',
            shortDate(m.paid_at)
        ]
        doc.font('Helvetica').fontSize(9).fillColor('#0d1b12')
        cells.forEach((text, c) =>
            doc.text(text, COLS[c][1], y, { width: COLS[c][2], lineBreak: false, ellipsis: true }))
        y += 18
    })

    doc.end()
})