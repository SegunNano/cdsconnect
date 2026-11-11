import { Clock, XCircle } from 'lucide-react'
import { timeAgo, formatDate, ageInHours } from '../../utils/dates'
import { card, FONT } from './styles'

export default function RequestsPanel({ requests, cancellingId, onCancel }) {
    const pending = requests.find(r => r.status === 'pending')
    // Rejections stay visible for a week so the member can read the reason
    const rejected = requests
        .filter(r => r.status === 'rejected' && ageInHours(r.reviewed_at) < 168)
        .slice(0, 3)

    if (!pending && rejected.length === 0) return null

    return (
        <div style={{ marginBottom: '16px' }}>
            {pending && (
                <div style={{ ...card, background: '#fff8e6', border: '1px solid #f3dfa6', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Clock size={16} color="#d4900a" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b12' }}>
                            Top-up request pending
                        </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4a5e52', marginBottom: '10px' }}>
                        {pending.tokens_requested} token{pending.tokens_requested !== 1 ? 's' : ''}
                        {' · ₦'}{Number(pending.naira_value).toLocaleString()}
                        {' · sent '}{timeAgo(pending.created_at)}. Waiting for the treasurer.
                    </div>
                    <button
                        onClick={() => onCancel(pending.id)}
                        disabled={cancellingId === pending.id}
                        style={{
                            background: '#ffffff', border: '1px solid #e8d9a8', borderRadius: '10px',
                            padding: '8px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#d4900a',
                            cursor: 'pointer', fontFamily: FONT,
                            opacity: cancellingId === pending.id ? 0.6 : 1
                        }}
                    >
                        {cancellingId === pending.id ? 'Cancelling...' : 'Cancel request'}
                    </button>
                </div>
            )}

            {rejected.map(r => (
                <div key={r.id} style={{ ...card, borderLeft: '4px solid #e53e3e', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <XCircle size={16} color="#e53e3e" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b12' }}>
                            Request rejected
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#8fa396', marginLeft: 'auto' }}>
                            {formatDate(r.reviewed_at)}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4a5e52' }}>
                        {r.tokens_requested} token{r.tokens_requested !== 1 ? 's' : ''}: {r.treasurer_note || 'No reason given.'}
                    </div>
                </div>
            ))}
        </div>
    )
}