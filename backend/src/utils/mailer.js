import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendMail = async ({ to, subject, html }) => {
    const { error } = await resend.emails.send({
        from: `CDSConnect <${process.env.MAIL_FROM}>`,
        to,
        subject,
        html
    })

    if (error) {
        console.error('Resend error:', error.message)
        throw { status: 502, message: 'Could not send email. Try again.' }
    }
}