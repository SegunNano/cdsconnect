import { CheckCircle2, FileText, Award } from 'lucide-react'
import { formatDate } from '../../utils/dates'
import { card } from '../tokens/styles'

export default function CertificateStatus({ certStatus }) {
    if (!certStatus?.has_paid) return null

    return (
        <div style={{ ...card, borderRadius: '18px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={22} color="#008751" />
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b12' }}>Certificate payment received</div>
                    {certStatus.paid_at && (
                        <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>Paid {formatDate(certStatus.paid_at)}</div>
                    )}
                </div>
            </div>
            <div style={{ background: '#f8fdf9', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px', fontSize: '0.82rem', color: '#0d1b12', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="#008751" /> Certificate of membership
                </div>
                {certStatus.is_exco && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={14} color="#b8860b" /> Certificate of excellence
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4a5e52', lineHeight: 1.5 }}>
                Your executives will hand over your certificate{certStatus.is_exco ? 's' : ''} in person.
            </div>
        </div>
    )
}