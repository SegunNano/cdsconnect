import { useState, useEffect, useCallback } from 'react'
import { Vote, ChevronRight, ShieldCheck, UserX } from 'lucide-react'
import ModalShell from '../common/ModalShell'
import {
    getElectionAdmin, createElection, electionPhase, removeElectionCandidate
} from '../../services/election.service'
import { formatDate } from '../../utils/dates'
import { FONT, labelStyle, inputStyle, btn, errorBox } from '../tokens/styles'

const roleLabel = (r) => r.replace(/_/g, ' ')
const holderName = (p) => (p.holder_first ? `${p.holder_first} ${p.holder_last}` : 'Vacant')

const STATUS = {
    setup: ['Setup', '#4a5e52', '#f2f4f7'],
    applications: ['Applications open', '#008751', '#e6f4ee'],
    review: ['Applications closed', '#d4900a', '#fff8e6'],
    voting: ['Voting open', '#4f46e5', '#eef2ff'],
    closed: ['Closed', '#4a5e52', '#f2f4f7']
}

const NEXT = {
    setup: { action: 'open_applications', label: 'Open applications', pin: false,
        note: 'Members will be able to apply for the positions in this election.' },
    applications: { action: 'close_applications', label: 'Close applications', pin: false,
        note: 'Candidate profiles are frozen and every candidate becomes visible to members. Applications cannot be reopened.' },
    review: { action: 'start_voting', label: 'Start voting', pin: true,
        note: 'The candidate list is locked and members can vote. This cannot be undone.' },
    voting: { action: 'close_election', label: 'Close election', pin: true,
        note: 'Votes are counted, candidate photos are deleted, and results show to members for the rest of today. This cannot be undone.' }
}

const CANCEL = { action: 'close_election', label: 'Cancel election', pin: true,
    note: 'Ends the election now without a vote. Applications are discarded and photos are deleted. This cannot be undone.' }

const resultLine = (p) =>
    p.status === 'vacant' ? 'No candidates, stays vacant'
    : p.status === 'no_result' ? 'No votes were cast'
    : p.status === 'tie' ? `Tie: ${p.candidates.filter(c => c.winner).map(c => c.name).join(' and ')}`
    : `${p.candidates.find(c => c.winner)?.name}${p.status === 'unopposed' ? ' (unopposed)' : ''}`

export default function ElectionCard({ card, sectionHead }) {
    const [data, setData] = useState(undefined)      // undefined = loading, null = failed
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ title: '', months: 3, roles: [] })
    const [phase, setPhase] = useState(null)
    const [pin, setPin] = useState('')
    const [removing, setRemoving] = useState(null)
    const [reason, setReason] = useState('')

    const load = useCallback(
        () => getElectionAdmin()
            .then(res => setData(res))
            .catch(() => setData(null)),
        []
    )
    useEffect(() => { load() }, [load])

    const election = data?.election
    const next = election ? NEXT[election.status] : null

    const toggleRole = (role) => setForm(f => ({
        ...f,
        roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role]
    }))

    const create = async () => {
        setError('')
        if (form.title.trim().length < 3) return setError('Give the election a title.')
        if (form.roles.length === 0) return setError('Pick at least one position.')
        setBusy(true)
        try {
            await createElection({ title: form.title.trim(), roles: form.roles, minMonthsLeft: form.months })
            setForm({ title: '', months: 3, roles: [] })
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create the election.')
        } finally {
            setBusy(false)
        }
    }

    const runPhase = async () => {
        setBusy(true)
        setError('')
        try {
            const res = await electionPhase({ action: phase.action, pin })
            setData(res) // Changed from res.data to res
            setPhase(null)
            setPin('')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.')
            setPin('')
        } finally {
            setBusy(false)
        }
    }

    const remove = async () => {
        if (reason.trim().length < 3) return setError('Give a reason. The member will see it.')
        setBusy(true)
        setError('')
        try {
            const res = await removeElectionCandidate(removing.id, reason.trim())
            setData(res) // Changed from res.data to res
            setRemoving(null)
            setReason('')
        } catch (err) {
            setError(err.response?.data?.message || 'Could not remove the application.')
        } finally {
            setBusy(false)
        }
    }

    const summary = election
        ? `${data.positions.length} position${data.positions.length !== 1 ? 's' : ''} · ${data.applications.length} application${data.applications.length !== 1 ? 's' : ''}`
          + (data.turnout ? ` · ${data.turnout.voted} of ${data.turnout.eligible} voted` : '')
        : 'Create an election to fill vacant positions'

    const chip = election ? STATUS[election.status] : null
    const pinOk = !phase?.pin || pin.length >= 4

    return (
        <>
            <div style={{ ...sectionHead, marginTop: '16px' }}>Election</div>
            <div style={card}>
                <div
                    onClick={() => { setOpen(o => !o); setError('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                    <Vote size={18} color="#008751" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                            {election ? election.title : 'No active election'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>{summary}</div>
                    </div>
                    {chip && (
                        <span style={{ background: chip[2], color: chip[1], fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                            {chip[0]}
                        </span>
                    )}
                    <ChevronRight size={16} color="#8fa396" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {open && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid #f2f4f7', paddingTop: '14px' }}>
                        {error && !phase && !removing && <div style={errorBox}>{error}</div>}
                        {data === undefined && <div style={{ fontSize: '0.8rem', color: '#8fa396' }}>Loading...</div>}
                        {data === null && <div style={errorBox}>Could not load the election.</div>}

                        {/* ── NO ACTIVE ELECTION: CREATE ── */}
                        {data && !election && (
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={labelStyle}>Title</label>
                                    <input
                                        value={form.title} maxLength={100} placeholder="e.g. December exco election"
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <label style={labelStyle}>Positions to fill</label>
                                <div style={{ marginBottom: '12px' }}>
                                    {data.electable.map(p => (
                                        <label key={p.role} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '9px 0', borderBottom: '1px solid #f2f4f7', cursor: 'pointer'
                                        }}>
                                            <input type="checkbox" checked={form.roles.includes(p.role)} onChange={() => toggleRole(p.role)} />
                                            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', textTransform: 'capitalize' }}>
                                                {roleLabel(p.role)}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: p.holder_first ? '#8fa396' : '#008751', fontWeight: p.holder_first ? 400 : 700 }}>
                                                {holderName(p)}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Minimum months of service left to run</label>
                                    <input
                                        type="number" min="0" max="12" value={form.months}
                                        onChange={e => setForm({ ...form, months: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <button onClick={create} disabled={busy} style={btn('#008751', 'white', busy)}>
                                    {busy ? 'Creating...' : 'Create election'}
                                </button>

                                {data.last_result && (
                                    <div style={{ marginTop: '18px' }}>
                                        <div style={labelStyle}>Last election: {data.last_result.title}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#8fa396', marginBottom: '8px' }}>
                                            Closed {formatDate(data.last_result.closed_at)}
                                            {data.last_result.turnout.eligible
                                                ? ` · ${data.last_result.turnout.voted} of ${data.last_result.turnout.eligible} voted` : ''}
                                        </div>
                                        {data.last_result.positions.map(p => (
                                            <div key={p.role} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem', padding: '5px 0' }}>
                                                <span style={{ color: '#8fa396', textTransform: 'capitalize' }}>{roleLabel(p.role)}</span>
                                                <span style={{ color: '#0d1b12', fontWeight: 600, textAlign: 'right' }}>{resultLine(p)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── ACTIVE ELECTION ── */}
                        {data && election && (
                            <>
                                <div style={labelStyle}>Positions</div>
                                <div style={{ marginBottom: '14px' }}>
                                    {data.positions.map(p => (
                                        <div key={p.role} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '7px 0', borderBottom: '1px solid #f2f4f7' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', textTransform: 'capitalize' }}>{roleLabel(p.role)}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>Now: {holderName(p)}</div>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textAlign: 'right', color: p.candidates === 0 ? '#8fa396' : '#008751' }}>
                                                {p.candidates === 0 ? 'No candidates' : p.candidates === 1 ? '1 candidate (unopposed)' : `${p.candidates} candidates`}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {data.applications.length > 0 && (
                                    <>
                                        <div style={labelStyle}>Applications</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                                            {data.applications.map(a => (
                                                <div key={a.id} style={{ background: '#f8fdf9', borderRadius: '12px', padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        {a.photo_url
                                                            ? <img src={a.photo_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                                                            : <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e6f4ee' }} />}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b12' }}>{a.first_name} {a.last_name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#8fa396', textTransform: 'capitalize' }}>
                                                                {a.state_code} · {roleLabel(a.role)}
                                                            </div>
                                                        </div>
                                                        {['applications', 'review'].includes(election.status) && (
                                                            <button
                                                                onClick={() => { setRemoving(a); setReason(''); setError('') }}
                                                                aria-label="Remove application"
                                                                style={{ background: '#fff0f0', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <UserX size={15} color="#e53e3e" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#4a5e52', marginTop: '8px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                        {a.manifesto}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {next && (
                                    <button onClick={() => { setError(''); setPin(''); setPhase(next) }} style={btn('#008751', 'white')}>
                                        {next.label}
                                    </button>
                                )}
                                {election.status !== 'voting' && (
                                    <button
                                        onClick={() => { setError(''); setPin(''); setPhase(CANCEL) }}
                                        style={{ ...btn('#fff0f0', '#e53e3e'), marginTop: '8px' }}
                                    >
                                        {CANCEL.label}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* PHASE CONFIRMATION */}
            {phase && (
                <ModalShell title={phase.label} onClose={busy ? () => {} : () => { setPhase(null); setError('') }} dismissOnBackdrop={false}>
                    {error && <div style={errorBox}>{error}</div>}
                    <div style={{ fontSize: '0.82rem', color: '#4a5e52', lineHeight: 1.5, marginBottom: '14px' }}>{phase.note}</div>
                    {phase.pin && (
                        <>
                            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShieldCheck size={13} /> Enter your PIN to confirm
                            </label>
                            <input
                                type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                style={{ ...inputStyle, marginBottom: '14px', letterSpacing: '4px' }}
                            />
                        </>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                        <button onClick={() => { setPhase(null); setError('') }} disabled={busy} style={btn('#f2f4f7', '#4a5e52', busy)}>Back</button>
                        <button onClick={runPhase} disabled={busy || !pinOk} style={btn(phase === CANCEL ? '#e53e3e' : '#008751', 'white', busy || !pinOk)}>
                            {busy ? 'Working...' : 'Confirm'}
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* REMOVE AN APPLICATION */}
            {removing && (
                <ModalShell title="Remove application" onClose={busy ? () => {} : () => { setRemoving(null); setError('') }} dismissOnBackdrop={false}>
                    {error && <div style={errorBox}>{error}</div>}
                    <div style={{ fontSize: '0.82rem', color: '#4a5e52', marginBottom: '12px' }}>
                        Remove {removing.first_name} {removing.last_name}'s application for <b style={{ textTransform: 'capitalize' }}>{roleLabel(removing.role)}</b>? Their photo is deleted and they see your reason.
                    </div>
                    <textarea
                        value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={300}
                        placeholder="Reason" style={{ ...inputStyle, resize: 'none', marginBottom: '14px', fontFamily: FONT }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                        <button onClick={() => { setRemoving(null); setError('') }} disabled={busy} style={btn('#f2f4f7', '#4a5e52', busy)}>Back</button>
                        <button onClick={remove} disabled={busy} style={btn('#e53e3e', 'white', busy)}>{busy ? 'Removing...' : 'Remove'}</button>
                    </div>
                </ModalShell>
            )}
        </>
    )
}