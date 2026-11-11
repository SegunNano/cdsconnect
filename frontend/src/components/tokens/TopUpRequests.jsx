import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ExternalLink, Check, X, ChevronDown, ChevronUp, Hourglass, CheckCircle2, XCircle } from 'lucide-react'
import { getTopUpRequests } from '../../services/tokens.service'
import { timeAgo, ageInHours, formatDate } from '../../utils/dates'
import Toast from '../common/Toast'
import CopyButton from './CopyButton'
import ReviewModal from './ReviewModal'
import { card, btn, FONT } from './styles'

const FILTERS = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
]
const PAGE = 5

const Row = ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.78rem', padding: '3px 0' }}>
        <span style={{ color: '#8fa396' }}>{label}</span>
        <span style={{ color: '#0d1b12', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'right' }}>
            {children}
        </span>
    </div>
)

function RequestCard({ request: r, onApprove, onReject }) {
    const [expanded, setExpanded] = useState(false)
    const pending = r.status === 'pending'
    const approved = r.status === 'approved'

    return (
        <div style={{ ...card, cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setExpanded(prev => !prev)}>
            {/* COLLAPSED HEADER VIEW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {/* STATUS ICON */}
                    <div style={{ marginTop: '2px' }}>
                        {pending && <Hourglass size={14} color="#8fa396" />}
                        {approved && <CheckCircle2 size={14} color="#008751" />}
                        {!pending && !approved && <XCircle size={14} color="#e53e3e" />}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                            {r.member_first_name} {r.member_last_name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                            {r.state_code} &bull; <strong style={{ color: '#008751' }}>{r.tokens_requested} token{r.tokens_requested !== 1 ? 's' : ''}</strong>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textAlign: 'right' }}>
                        {timeAgo(r.created_at)}
                    </div>
                    {expanded ? <ChevronUp size={16} color="#8fa396" /> : <ChevronDown size={16} color="#8fa396" />}
                </div>
            </div>

            {/* EXPANDED FULL DETAILS */}
            {expanded && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #edf2ef', paddingTop: '10px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008751', marginBottom: '8px' }}>
                        ₦{Number(r.naira_value).toLocaleString()}
                    </div>

                    <Row label="Paid by">{r.sender_name}</Row>
                    <Row label="Reference">{r.transfer_reference}<CopyButton text={r.transfer_reference} /></Row>
                    <Row label="Proof">
                        {r.proof_url
                            ? <a href={r.proof_url} target="_blank" rel="noreferrer" style={{ color: '#008751', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                View <ExternalLink size={12} />
                              </a>
                            : <span style={{ color: '#8fa396', fontWeight: 400 }}>{pending ? 'None attached' : 'Deleted after review'}</span>}
                    </Row>

                    {!pending && (
                        <div style={{ fontSize: '0.72rem', color: '#4a5e52', marginTop: '8px', background: '#f8faf9', padding: '8px', borderRadius: '8px' }}>
                            {approved
                                ? `Approved ${r.tokens_approved ?? r.tokens_requested} token(s)`
                                : 'Rejected'}
                            {r.reviewer_first_name ? ` by ${r.reviewer_first_name}` : ''} &bull; {formatDate(r.reviewed_at)}
                            {r.treasurer_note && <div style={{ marginTop: '2px' }}>Note: {r.treasurer_note}</div>}
                        </div>
                    )}

                    {pending && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                            <button onClick={() => onReject(r)} style={{ ...btn('#fff0f0', '#e53e3e'), padding: '10px' }}>
                                <X size={14} /> Reject
                            </button>
                            <button onClick={() => onApprove(r)} style={{ ...btn('#008751', 'white'), padding: '10px' }}>
                                <Check size={14} /> Approve
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function TopUpRequests({ onChanged }) {
    const [status, setStatus] = useState('pending')
    const [limit, setLimit] = useState(PAGE)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [review, setReview] = useState(null)
    const [toast, setToast] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getTopUpRequests({ status, limit })
            setRequests(res?.data || [])
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load requests.')
        } finally {
            setLoading(false)
        }
    }, [status, limit])

    useEffect(() => { load() }, [load])

    const selectStatus = (key) => { setStatus(key); setLimit(PAGE) }

    const handleDone = (message) => {
        setReview(null)
        setToast({ type: 'success', text: message })
        load()
        onChanged?.()
    }

    return (
        <>
            <Toast message={toast?.text} type={toast?.type} onClose={() => setToast(null)} />

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
                {FILTERS.map(f => (
                    <button
                        key={f.key} onClick={() => selectStatus(f.key)}
                        style={{
                            padding: '7px 13px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                            background: status === f.key ? '#008751' : '#ffffff',
                            color: status === f.key ? 'white' : '#4a5e52',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
                <button
                    onClick={load} aria-label="Refresh"
                    style={{ marginLeft: 'auto', background: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                    <RefreshCw size={14} color="#4a5e52" />
                </button>
            </div>

            {error && (
                <div style={{ background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem', padding: '10px 14px', borderRadius: '10px', marginBottom: '12px' }}>
                    {error}
                </div>
            )}

            {loading && requests.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>Loading...</div>
            )}

            {!loading && !error && requests.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '30px' }}>
                    {status === 'pending' ? 'All caught up. No pending requests.' : `No ${status} requests.`}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requests.map(r => (
                    <RequestCard
                        key={r.id} request={r}
                        onApprove={(req) => setReview({ request: req, action: 'approve' })}
                        onReject={(req) => setReview({ request: req, action: 'reject' })}
                    />
                ))}
            </div>

            {requests.length >= limit && (
                <button
                    onClick={() => setLimit(l => l + PAGE)} disabled={loading}
                    style={{ ...btn('#ffffff', '#4a5e52', loading), border: '1px solid #e8ece9', marginTop: '10px', padding: '11px', fontSize: '0.78rem' }}
                >
                    Show More
                </button>
            )}

            {review && (
                <ReviewModal
                    request={review.request} action={review.action}
                    onClose={() => setReview(null)} onDone={handleDone}
                />
            )}
        </>
    )
}