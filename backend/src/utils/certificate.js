import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nyscLogoPath = path.join(__dirname, '../assets/nysc-logo.png')
const infoTechLogoPath = path.join(__dirname, '../assets/infotech-logo.png')
const coordinatorSignaturePath = path.join(__dirname, '../assets/coordinator-signature.png')

const PAGE_WIDTH = 841.89  // A4 landscape
const PAGE_HEIGHT = 595.28

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

const createDoc = (stateCode, title) => new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    userPassword: '',
    ownerPassword: `CERT-${stateCode}-${Date.now()}`,
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
        Title: title,
        Author: 'CDSConnect System'
    }
})

const drawHeader = (doc) => {
    doc.rect(0, 0, PAGE_WIDTH, 10).fill('#008751')

    if (fs.existsSync(nyscLogoPath)) {
        doc.image(nyscLogoPath, 45, 28, { width: 60 })
    }
    if (fs.existsSync(infoTechLogoPath)) {
        doc.image(infoTechLogoPath, PAGE_WIDTH - 100, 33, { width: 55 })
    }

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14)
        .text('NATIONAL YOUTH SERVICE CORPS', 0, 32, { align: 'center', width: PAGE_WIDTH })
    doc.fontSize(10).fillColor('#333333').font('Helvetica')
        .text('FEDERAL REPUBLIC OF NIGERIA', 0, 50, { align: 'center', width: PAGE_WIDTH })
    doc.fillColor('#008751').fontSize(10).font('Helvetica-Bold')
        .text('INFOTECH CDS GROUP · LAGOS STATE', 0, 64, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(45, 90).lineTo(PAGE_WIDTH - 45, 90)
        .strokeColor('#d0d8d3').lineWidth(1).stroke()
}

const drawWatermark = (doc, color = '#008751') => {
    doc.save()
    doc.rotate(-30, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] })
    doc.fontSize(80).font('Helvetica-Bold').fillColor(color).fillOpacity(0.04)
        .text('INFOTECH CDS', 100, PAGE_HEIGHT / 2 - 60, { lineBreak: false })
    doc.restore()
    doc.fillOpacity(1)
}

const drawNameBlock = (doc, fullName, stateCode, startY) => {
    doc.fillColor('#0d1b12').font('Helvetica-Bold').fontSize(20)
        .text(fullName, 0, startY, { align: 'center', width: PAGE_WIDTH })

    const nameWidth = Math.min(doc.widthOfString(fullName, { fontSize: 20 }), 400)
    const nameX = (PAGE_WIDTH - nameWidth) / 2
    doc.moveTo(nameX, startY + 27).lineTo(nameX + nameWidth, startY + 27)
        .strokeColor('#0d1b12').lineWidth(1).stroke()

    doc.fillColor('#333333').font('Helvetica').fontSize(12)
        .text('with state code', 0, startY + 40, {
            align: 'center', width: PAGE_WIDTH, continued: true
        })
        .font('Helvetica-Bold').text(`  ${stateCode}  `)
}

const drawSignatureBlock = (doc, serviceEnd) => {
    const sigY = doc.y + 20

    const dateStr = serviceEnd
        ? new Date(serviceEnd + 'T12:00:00Z').toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
        })
        : new Date().toLocaleDateString('en-GB')

    if (fs.existsSync(coordinatorSignaturePath)) {
        doc.image(coordinatorSignaturePath, PAGE_WIDTH - 220, sigY - 45, { height: 55 })
    }

    doc.moveTo(45, sigY).lineTo(200, sigY)
        .strokeColor('#000000').lineWidth(1).stroke()
    doc.font('Helvetica').fontSize(9).fillColor('#0d1b12')
        .text(dateStr, 45, sigY + 5)
    doc.fontSize(8).fillColor('#8fa396')
        .text('DATE', 45, sigY + 18)

    doc.moveTo(PAGE_WIDTH - 220, sigY).lineTo(PAGE_WIDTH - 45, sigY)
        .strokeColor('#000000').lineWidth(1).stroke()
    doc.fontSize(8).fillColor('#8fa396')
        .text("COORDINATOR'S SIGNATURE", PAGE_WIDTH - 220, sigY + 18)
}

const drawFooter = (doc) => {
    doc.fontSize(7).fillColor('#8fa396')
        .text(
            `CDSConnect · InfoTech CDS Lagos State · Generated ${new Date().toLocaleDateString('en-GB')}`,
            0, PAGE_HEIGHT - 28,
            { align: 'center', width: PAGE_WIDTH }
        )
    doc.rect(0, PAGE_HEIGHT - 10, PAGE_WIDTH, 10).fill('#008751')
}

const toBuffer = (doc) => new Promise((resolve, reject) => {
    const buffers = []
    doc.on('data', chunk => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)
})

// ── CERTIFICATE OF MEMBERSHIP ────────────────────────────────────
export const generateMembershipCertificate = async (member) => {
    const fullName = `${member.first_name} ${member.last_name}`
    const doc = createDoc(member.state_code, `Certificate of Membership — ${fullName}`)
    const promise = toBuffer(doc)

    drawHeader(doc)
    drawWatermark(doc, '#008751')

    doc.fillColor('#008751').font('Helvetica-Bold').fontSize(28)
        .text('Certificate of Membership', 0, 110, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(PAGE_WIDTH / 2 - 150, 150).lineTo(PAGE_WIDTH / 2 + 150, 150)
        .strokeColor('#008751').lineWidth(1.5).stroke()

    doc.fillColor('#333333').font('Helvetica').fontSize(13)
        .text('This is to certify that', 0, 170, { align: 'center', width: PAGE_WIDTH })

    drawNameBlock(doc, fullName, member.state_code, 195)

    doc.moveDown(1.2)
    doc.font('Helvetica').fontSize(12).fillColor('#333333')
        .text(
            'was a MEMBER of InfoTech CDS Group, Lagos State',
            0, doc.y, { align: 'center', width: PAGE_WIDTH }
        )
    doc.text(
        'in the National Youth Service Corps Scheme.',
        0, doc.y + 5, { align: 'center', width: PAGE_WIDTH }
    )

    doc.moveDown(0.6)
    doc.font('Helvetica').fontSize(11).fillColor('#008751')
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
        )

    drawSignatureBlock(doc, member.service_end)
    drawFooter(doc)
    doc.end()

    return promise
}

// ── CERTIFICATE OF EXCELLENCE ────────────────────────────────────
export const generateExcellenceCertificate = async (member) => {
    const fullName = `${member.first_name} ${member.last_name}`
    const doc = createDoc(member.state_code, `Certificate of Excellence — ${fullName}`)
    const promise = toBuffer(doc)

    drawHeader(doc)
    drawWatermark(doc, '#d4900a')

    doc.fillColor('#b8860b').font('Helvetica-Bold').fontSize(28)
        .text('Certificate of Excellence', 0, 110, { align: 'center', width: PAGE_WIDTH })

    doc.moveTo(PAGE_WIDTH / 2 - 150, 150).lineTo(PAGE_WIDTH / 2 + 150, 150)
        .strokeColor('#b8860b').lineWidth(1.5).stroke()

    doc.fillColor('#333333').font('Helvetica').fontSize(13)
        .text('This is to certify that', 0, 170, { align: 'center', width: PAGE_WIDTH })

    drawNameBlock(doc, fullName, member.state_code, 195)

    doc.moveDown(1.2)

    const roleFormatted = formatRole(member.role).toUpperCase()
    const batchLabel = `${member.stream_year} Batch ${member.stream_batch}`

    doc.font('Helvetica').fontSize(12).fillColor('#333333')
        .text(
            `successfully served as ${roleFormatted}`,
            0, doc.y, { align: 'center', width: PAGE_WIDTH }
        )
    doc.text(
        `of ${batchLabel} InfoTech CDS Group, Lagos State`,
        0, doc.y + 5, { align: 'center', width: PAGE_WIDTH }
    )
    doc.text(
        'in the National Youth Service Corps Scheme.',
        0, doc.y + 5, { align: 'center', width: PAGE_WIDTH }
    )

    doc.moveDown(0.6)
    doc.font('Helvetica').fontSize(11).fillColor('#b8860b')
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0, doc.y + 4, { align: 'center', width: PAGE_WIDTH }
        )

    drawSignatureBlock(doc, member.service_end)
    drawFooter(doc)
    doc.end()

    return promise
}