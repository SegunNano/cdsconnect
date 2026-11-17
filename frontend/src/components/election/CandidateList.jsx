import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import ModalShell from '../common/ModalShell'
import Avatar from './Avatar'
import { castElectionVote } from '../../services/election.service'
import { card, btn, errorBox } from '../tokens/styles'

const roleLabel = (r) => r.replace(/_/g, ' ')
const fullName = (p = {}) => `${p.first_name || ''} ${p.last_name || ''}`.trim()

function CandidateCard({ c, canVote, onVote }) {
    const [expanded, setExpanded] = useState(false)
    const p = c.profile || {}
    const long = c.manifesto.length > 160

    return (
        <div style={{ ...card, display: 'flex', gap: '12px' }}>
            <Avatar url={c.photo_url} name={fullName(p)} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b12' }}>{fullName(p)}</span>
                    {c.is_mine && (
                        <span style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>YOU</span>
                    )}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8fa396', margin: '2px 0 8px' }}>
                    {[p.state_code, p.stream, p.breakout_session].filter(Boolean).join(' · ')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {expanded || !long ? c.manifesto : `${c.manifesto.slice(0, 160)}...`}
                </div>
                {long && (
                    <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', padding: '4px 0', color: '#008751', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
                {canVote && (
                    <button onClick={onVote} style={{ ...btn('#008751', 'white'), marginTop: '10px', padding: '10px' }}>Vote</button>
                )}
            </div>
        </div>
    )
}

export default function CandidateList({ state, onVoted }) {
    const voting = state.status === 'voting'
    const voted = state.voted_roles || []
    const unopposed = state.unopposed_roles || []
    const [pending, setPending] = useState(null)       // { role, candidate }
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const inRole = (role) => state.candidates.filter(c => c.role === role)
    const contested = state.positions.filter(p => inRole(p.role).length >= 2)
    const votedCount = contested.filter(p => voted.includes(p.role)).length

    const confirm = async () => {
        setBusy(true)
        setError('')
        try {
            await castElectionVote({ role: pending.role, candidateId: pending.candidate.id })
            setPending(null)
            await onVoted()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not record your vote.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <div style={{ ...card, background: voting ? '#eef2ff' : '#f8fdf9', marginBottom: '14px', fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6 }}>
                {!voting && <><b style={{ color: '#0d1b12' }}>Applications are closed.</b> Read each candidate's manifesto. Voting opens when the dev starts it.</>}
                {voting && state.can_vote && (
                    <><b style={{ color: '#0d1b12' }}>Voting is open.</b> You have voted in {votedCount} of {contested.length} position{contested.length !== 1 ? 's' : ''}. Votes are secret and final.</>
                )}
                {voting && !state.can_vote && (
                    <><b style={{ color: '#0d1b12' }}>Voting is open.</b> Your account was created after voting opened, so you can't vote in this election.</>
                )}
            </div>

            {state.positions.map(p => {
                const list = inRole(p.role)
                const hasVoted = voted.includes(p.role)
                return (
                    <div key={p.role} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1b12', textTransform: 'capitalize' }}>{roleLabel(p.role)}</span>
                            {voting && hasVoted && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#008751' }}>
                                    <CheckCircle size={14} /> You voted
                                </span>
                            )}
                            {voting && unopposed.includes(p.role) && (
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8fa396' }}>Unopposed, no vote needed</span>
                            )}
                        </div>
                        {list.length === 0 ? (
                            <div style={{ ...card, color: '#8fa396', fontSize: '0.8rem', textAlign: 'center' }}>No candidates for this position</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {list.map(c => (
                                    <CandidateCard
                                        key={c.id} c={c}
                                        canVote={voting && state.can_vote && !hasVoted && list.length >= 2}
                                        onVote={() => { setError(''); setPending({ role: p.role, candidate: c }) }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}

            {pending && (
                <ModalShell title="Confirm your vote" onClose={busy ? () => {} : () => setPending(null)} dismissOnBackdrop={false}>
                    {error && <div style={errorBox}>{error}</div>}
                    <div style={{ fontSize: '0.85rem', color: '#4a5e52', lineHeight: 1.6, marginBottom: '16px' }}>
                        Vote for <b>{fullName(pending.candidate.profile)}</b> as{' '}
                        <b style={{ textTransform: 'capitalize' }}>{roleLabel(pending.role)}</b>? Your vote is secret and
                        can't be changed.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                        <button onClick={() => setPending(null)} disabled={busy} style={btn('#f2f4f7', '#4a5e52', busy)}>Back</button>
                        <button onClick={confirm} disabled={busy} style={btn('#008751', 'white', busy)}>
                            {busy ? 'Voting...' : 'Confirm vote'}
                        </button>
                    </div>
                </ModalShell>
            )}
        </>
    )
}