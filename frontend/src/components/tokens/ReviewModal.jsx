import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import ModalShell from '../common/ModalShell'
import { TokenCounter } from './TokenCounter'
import { reviewTopUpRequest } from '../../services/tokens.service'
import { RATE } from '../../constants'
import { card, labelStyle, inputStyle, btn, errorBox } from './styles'

export default function ReviewModal({ request, action, onClose, onDone }) {
    const approving = action === 'approve'
    const requested = request.tokens_requested
    const [tokens, setTokens] = useState(requested)
    const [note, setNote] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const changed = approving && tokens !== requested

    const submit = async () => {
        const trimmed = note.trim()
        setError('')
        if (!approving && trimmed.length < 3) return setError('Give the member a reason for rejecting.')
        if (changed && !trimmed) return setError('Add a note explaining why the amount changed.')

        setBusy(true)
        try {
            await reviewTopUpRequest(request.id, {
                action,
                treasurerNote: trimmed || undefined,
                adjustedTokens: changed ? tokens : undefined
            })
            onDone(approving
                ? `${tokens} token(s) credited to ${request.member_first_name}.`
                : 'Request rejected.')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ModalShell
            title={approving ? 'Approve request' : 'Reject request'}
            icon={approving ? <CheckCircle size={18} color="#008751" /> : <XCircle size={18} color="#e53e3e" />}
            onClose={busy ? () => {} : onClose} dismissOnBackdrop={false}
        >
            {error && <div style={errorBox}>{error}</div>}

            <div style={{ ...card, background: '#f8fdf9', fontSize: '0.8rem', color: '#0d1b12', lineHeight: 1.7, marginBottom: '14px' }}>
                <div><b>{request.member_first_name} {request.member_last_name}</b> · {request.state_code}</div>
                <div>Requested: <b>{requested}</b> token{requested !== 1 ? 's' : ''} (₦{Number(request.naira_value).toLocaleString()})</div>
                <div>Paid by: {request.sender_name}</div>
                <div>Reference: {request.transfer_reference}</div>
            </div>

            {approving && (
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Tokens to credit (match your bank alert)</label>
                    <TokenCounter tokens={tokens} rate={RATE} onChange={setTokens} />
                </div>
            )}

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>
                    {approving ? (changed ? 'Note (required, amount changed)' : 'Note (optional)') : 'Reason (required)'}
                </label>
                <textarea
                    value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={300}
                    placeholder={approving ? 'e.g. Paid ₦1,500, credited 3 tokens' : 'e.g. No matching transfer found'}
                    style={{ ...inputStyle, resize: 'none' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                <button onClick={onClose} disabled={busy} style={btn('#f2f4f7', '#4a5e52', busy)}>Cancel</button>
                <button
                    onClick={submit} disabled={busy}
                    style={btn(approving ? '#008751' : '#e53e3e', 'white', busy)}
                >
                    {busy ? 'Working...' : approving ? 'Approve' : 'Reject'}
                </button>
            </div>
        </ModalShell>
    )
}