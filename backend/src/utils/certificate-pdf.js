import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nyscLogoPath = path.join(__dirname, '../assets/logos/nysc-logo.png')
const infoTechLogoPath = path.join(__dirname, '../assets/logos/infotech-logo.png')
const coordinatorSignaturePath = path.join(__dirname, '../assets/signatures/coordinator-sig.png')

const formatRole = (role = '') => {
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

    return roles[role] || role.replaceAll('_', ' ')
}

const drawHeader = (doc, pageWidth) => {
    // Green top bar.
    doc.rect(0, 0, pageWidth, 10).fill('#008751')

    const logoY = 28

    if (fs.existsSync(nyscLogoPath)) {
        doc.image(nyscLogoPath, 45, logoY, { width: 60 })
    }

    if (fs.existsSync(infoTechLogoPath)) {
        doc.image(infoTechLogoPath, pageWidth - 100, logoY + 5, { width: 55 })
    }

    doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('NATIONAL YOUTH SERVICE CORPS', 0, 32, {
            align: 'center',
            width: pageWidth
        })

    doc.fontSize(10)
        .fillColor('#333333')
        .text('FEDERAL REPUBLIC OF NIGERIA', 0, 50, {
            align: 'center',
            width: pageWidth
        })

    doc.fillColor('#008751')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('INFOTECH CDS GROUP · LAGOS STATE', 0, 64, {
            align: 'center',
            width: pageWidth
        })

    doc.moveTo(45, 90)
        .lineTo(pageWidth - 45, 90)
        .strokeColor('#d0d8d3')
        .lineWidth(1)
        .stroke()
}

const drawSignatureBlock = (doc, pageWidth, serviceEnd) => {
    const signatureY = doc.y + 20

    const dateString = serviceEnd
        ? new Date(`${serviceEnd}T12:00:00Z`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        })
        : new Date().toLocaleDateString('en-GB')

    // Date line.
    doc.moveTo(45, signatureY)
        .lineTo(200, signatureY)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke()

    doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#0d1b12')
        .text(dateString, 45, signatureY + 5)

    doc.fontSize(8)
        .fillColor('#8fa396')
        .text('DATE', 45, signatureY + 18)

    // Coordinator signature image.
    if (fs.existsSync(coordinatorSignaturePath)) {
        doc.image(coordinatorSignaturePath, pageWidth - 220, signatureY - 45, {
            height: 55
        })
    }

    doc.moveTo(pageWidth - 220, signatureY)
        .lineTo(pageWidth - 45, signatureY)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke()

    doc.fontSize(8)
        .fillColor('#8fa396')
        .text("COORDINATOR'S SIGNATURE", pageWidth - 220, signatureY + 18)
}

const drawFooter = (doc, pageWidth, pageHeight) => {
    doc.fontSize(7)
        .fillColor('#8fa396')
        .text(
            `CDSConnect · InfoTech CDS Lagos State · Generated ${new Date().toLocaleDateString('en-GB')}`,
            0,
            pageHeight - 30,
            { align: 'center', width: pageWidth }
        )

    // Green bottom bar.
    doc.rect(0, pageHeight - 10, pageWidth, 10).fill('#008751')
}

const createPdfBuffer = (doc) => new Promise((resolve, reject) => {
    const buffers = []

    doc.on('data', (chunk) => buffers.push(chunk))
    doc.once('end', () => resolve(Buffer.concat(buffers)))
    doc.once('error', reject)
    doc.end()
})

const createCertificateDocument = ({ member, title, passwordPrefix }) => {
    return new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        ownerPassword: `${passwordPrefix}-${member.state_code}`,
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
            Title: `${title} — ${member.first_name} ${member.last_name}`,
            Author: 'CDSConnect System'
        }
    })
}

const drawWatermark = (doc, pageWidth, pageHeight, color) => {
    doc.save()
    doc.rotate(-30, { origin: [pageWidth / 2, pageHeight / 2] })
    doc.fontSize(80)
        .font('Helvetica-Bold')
        .fillColor(color)
        .fillOpacity(0.04)
        .text('INFOTECH CDS', 100, pageHeight / 2 - 60, {
            lineBreak: false
        })
    doc.restore()
    doc.fillOpacity(1)
}

const drawMemberNameAndStateCode = (doc, pageWidth, member) => {
    const fullName = `${member.first_name} ${member.last_name}`

    doc.fillColor('#0d1b12')
        .font('Helvetica-Bold')
        .fontSize(20)
        .text(fullName, 0, 195, {
            align: 'center',
            width: pageWidth
        })

    const nameWidth = doc.widthOfString(fullName, { fontSize: 20 })
    const underlineWidth = Math.min(nameWidth, 400)
    const nameX = (pageWidth - underlineWidth) / 2

    doc.moveTo(nameX, 222)
        .lineTo(nameX + underlineWidth, 222)
        .strokeColor('#0d1b12')
        .lineWidth(1)
        .stroke()

    doc.fillColor('#333333')
        .font('Helvetica')
        .fontSize(12)
        .text('with state code', 0, 235, {
            align: 'center',
            width: pageWidth,
            continued: true
        })
        .font('Helvetica-Bold')
        .text(` ${member.state_code} `, { continued: false })
}

const drawCertificateTitle = (doc, pageWidth, title, color) => {
    doc.fillColor(color)
        .font('Helvetica-Bold')
        .fontSize(28)
        .text(title, 0, 110, {
            align: 'center',
            width: pageWidth
        })

    doc.moveTo(pageWidth / 2 - 150, 150)
        .lineTo(pageWidth / 2 + 150, 150)
        .strokeColor(color)
        .lineWidth(1.5)
        .stroke()
}

export const generateMembershipCertificate = async (member) => {
    const pageWidth = 841.89
    const pageHeight = 595.28
    const doc = createCertificateDocument({
        member,
        title: 'Certificate of Membership',
        passwordPrefix: 'CERT-MEMB'
    })

    drawHeader(doc, pageWidth)
    drawWatermark(doc, pageWidth, pageHeight, '#008751')
    drawCertificateTitle(doc, pageWidth, 'Certificate of Membership', '#008751')

    doc.fillColor('#333333')
        .font('Helvetica')
        .fontSize(13)
        .text('This is to certify that', 0, 168, {
            align: 'center',
            width: pageWidth
        })

    drawMemberNameAndStateCode(doc, pageWidth, member)

    doc.moveDown(0.8)
    doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#333333')
        .text('was a MEMBER of InfoTech CDS Group, Lagos State', 0, doc.y, {
            align: 'center',
            width: pageWidth
        })

    doc.text(
        'in the National Youth Service Corps Scheme.',
        0,
        doc.y + 4,
        { align: 'center', width: pageWidth }
    )

    doc.moveDown(0.5)
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#008751')
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0,
            doc.y + 4,
            { align: 'center', width: pageWidth }
        )

    drawSignatureBlock(doc, pageWidth, member.service_end)
    drawFooter(doc, pageWidth, pageHeight)

    return createPdfBuffer(doc)
}

export const generateExcellenceCertificate = async (member) => {
    const pageWidth = 841.89
    const pageHeight = 595.28
    const title = 'Certificate of Excellence'
    const titleColor = '#b8860b'
    const doc = createCertificateDocument({
        member,
        title,
        passwordPrefix: 'CERT-EXCEL'
    })

    drawHeader(doc, pageWidth)
    drawWatermark(doc, pageWidth, pageHeight, '#d4900a')
    drawCertificateTitle(doc, pageWidth, title, titleColor)

    doc.fillColor('#333333')
        .font('Helvetica')
        .fontSize(13)
        .text('This is to certify that', 0, 168, {
            align: 'center',
            width: pageWidth
        })

    drawMemberNameAndStateCode(doc, pageWidth, member)

    doc.moveDown(0.8)

    const roleFormatted = formatRole(member.role).toUpperCase()
    const batchLabel = `${member.stream_year} Batch ${member.stream_batch}`

    doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#333333')
        .text(`successfully served as ${roleFormatted}`, 0, doc.y, {
            align: 'center',
            width: pageWidth
        })

    doc.text(
        `of ${batchLabel} InfoTech CDS Group, Lagos State`,
        0,
        doc.y + 4,
        { align: 'center', width: pageWidth }
    )

    doc.text(
        'in the National Youth Service Corps Scheme.',
        0,
        doc.y + 4,
        { align: 'center', width: pageWidth }
    )

    doc.moveDown(0.5)
    doc.font('Helvetica')
        .fontSize(11)
        .fillColor(titleColor)
        .text(
            `${member.stream_year} Batch ${member.stream_batch} Stream ${member.stream_number}`,
            0,
            doc.y + 4,
            { align: 'center', width: pageWidth }
        )

    drawSignatureBlock(doc, pageWidth, member.service_end)
    drawFooter(doc, pageWidth, pageHeight)

    return createPdfBuffer(doc)
}
