import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ModalShell from '../common/ModalShell'
import Avatar from './Avatar'
import {
    applyToElection, updateElectionApplication, withdrawElectionApplication
} from '../../services/election.service'
import { squarePhoto } from '../../utils/image'
import { card, sectionTitle, labelStyle, inputStyle, btn, errorBox, FONT } from '../tokens/styles'

const MIN = 20
const MAX = 1500
const roleLabel = (r) => r.replace(/_/g, ' ')

// Shared by the apply form and the edit modal
function usePhoto() {
    const [photo, setPhoto] = useState(null)          // { file, preview }
    const [preparing, setPreparing] = useState(false)
    const [photoError, setPhotoError] = useState('')

    const pick = async (e) => {
        const chosen = e.target.files?.[0]
        e.target.value = ''
        if (!chosen) return
        setPreparing(true)
        setPhotoError('')
        try {
            const file = await squarePhoto(chosen)
            if (photo) URL.revokeObjectURL(photo.preview)
            setPhoto({ file, preview: URL.createObjectURL(file) })
        } catch (err) {
            setPhotoError(err.message)
        } finally {
            setPreparing(false)
        }
    }
    return { photo, preparing, photoError, pick }
}

function PhotoPicker({ preview, fallbackUrl, preparing, onPick }) {
    const shown = preview || fallbackUrl
    return (
        <label style={{
            display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
            background: '#f2f4f7', borderRadius: '12px', padding: '10px 12px'
        }}>
            {shown
                ? <img src={shown} alt="Your photo" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                : <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e6f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={22} color="#008751" />
                  </div>}
            <span style={{ fontSize: '0.8rem', color: '#4a5e52', fontWeight: 600 }}>
                {preparing ? 'Preparing...' : shown ? 'Change photo' : 'Add a clear photo of your face'}
            </span>
            <input type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
        </label>
    )
}

const Counter = ({ length }) => (
    <div style={{ fontSize: '0.68rem', textAlign: 'right', marginTop: '4px', color: length > MAX || (length > 0 && length < MIN) ? '#e53e3e' : '#8fa396' }}>
        {length} / {MAX} (at least {MIN})
    </div>
)

function ApplyForm({ state, onDone }) {
    const { member, logout } = useAuth()
    const navigate = useNavigate()
    const [role, setRole] = useState('')
    const [manifesto, setManifesto] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [devRemoved, setDevRemoved] = useState(false)
    const { photo, preparing, photoError, pick } = usePhoto()

    const length = manifesto.trim().length
    const ready = role && photo && length >= MIN && length <= MAX

    const submit = async () => {
        if (member.is_dev && !window.confirm(
            'Applying will remove your dev access and sign you out. The other dev can give it back after the election. Continue?')) return
        setBusy(true)
        setError('')
        try {
            const res = await applyToElection({ role, manifesto: manifesto.trim(), photo: photo.file })
            if (res?.dev_removed) setDevRemoved(true)
            else await onDone()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit your application.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={card}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0d1b12', marginBottom: '12px' }}>Apply for a position</div>
            {(error || photoError) && <div style={errorBox}>{error || photoError}</div>}

            {member.is_dev && (
                <div style={{ background: '#fff8e6', color: '#b7791f', fontSize: '0.75rem', lineHeight: 1.5, padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                    You are a dev. Applying removes your dev access and signs you out.
                </div>
            )}

            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Position</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">Choose a position</option>
                    {state.positions.map(p => (
                        <option key={p.role} value={p.role} disabled={p.role === member.role}>
                            {roleLabel(p.role)}{p.role === member.role ? ' (your current position)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Photo</label>
                <PhotoPicker preview={photo?.preview} preparing={preparing} onPick={pick} />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Manifesto</label>
                <textarea
                    value={manifesto} onChange={e => setManifesto(e.target.value)} rows={6}
                    placeholder="What will you do if you are elected?"
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, fontFamily: FONT }}
                />
                <Counter length={length} />
            </div>

            <button onClick={submit} disabled={!ready || busy} style={btn('#008751', 'white', !ready || busy)}>
                {busy ? 'Submitting...' : 'Submit application'}
            </button>

            {devRemoved && (
                <ModalShell title="Application sent" onClose={() => {}} dismissOnBackdrop={false}>
                    <div style={{ fontSize: '0.82rem', color: '#4a5e52', lineHeight: 1.6, marginBottom: '16px' }}>
                        You have been removed as a dev for the election. Sign in again to continue as a member.
                    </div>
                    <button onClick={async () => { await logout(); navigate('/login') }} style={btn('#008751', 'white')}>
                        Sign in again
                    </button>
                </ModalShell>
            )}
        </div>
    )
}

function EditModal({ app, onClose, onDone }) {
    const [manifesto, setManifesto] = useState(app.manifesto)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const { photo, preparing, photoError, pick } = usePhoto()
    const length = manifesto.trim().length
    const valid = length >= MIN && length <= MAX

    const save = async () => {
        setBusy(true)
        setError('')
        try {
            await updateElectionApplication({ manifesto: manifesto.trim(), photo: photo?.file })
            await onDone()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save your changes.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ModalShell title="Edit application" onClose={busy ? () => {} : onClose} dismissOnBackdrop={false}>
            {(error || photoError) && <div style={errorBox}>{error || photoError}</div>}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Photo</label>
                <PhotoPicker preview={photo?.preview} fallbackUrl={app.photo_url} preparing={preparing} onPick={pick} />
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Manifesto</label>
                <textarea
                    value={manifesto} onChange={e => setManifesto(e.target.value)} rows={6}
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, fontFamily: FONT }}
                />
                <Counter length={length} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                <button onClick={onClose} disabled={busy} style={btn('#f2f4f7', '#4a5e52', busy)}>Cancel</button>
                <button onClick={save} disabled={busy || !valid} style={btn('#008751', 'white', busy || !valid)}>
                    {busy ? 'Saving...' : 'Save'}
                </button>
            </div>
        </ModalShell>
    )
}

function MyApplication({ state, onDone }) {
    const { member } = useAuth()
    const app = state.my_application
    const [editing, setEditing] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const withdraw = async () => {
        if (!window.confirm('Withdraw your application? Your photo will be deleted.')) return
        setBusy(true)
        setError('')
        try {
            await withdrawElectionApplication()
            await onDone()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not withdraw.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={card}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#008751', textTransform: 'uppercase', marginBottom: '10px' }}>
                Your application
            </div>
            {error && <div style={errorBox}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <Avatar url={app.photo_url} name={`${member.first_name} ${member.last_name}`} size={64} />
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b12' }}>{member.first_name} {member.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8fa396', textTransform: 'capitalize' }}>Running for {roleLabel(app.role)}</div>
                </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                {app.manifesto}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => setEditing(true)} disabled={busy} style={btn('#eaf2fb', '#2b6cb0', busy)}>Edit</button>
                <button onClick={withdraw} disabled={busy} style={btn('#fff0f0', '#e53e3e', busy)}>
                    {busy ? 'Working...' : 'Withdraw'}
                </button>
            </div>
            {editing && <EditModal app={app} onClose={() => setEditing(false)} onDone={onDone} />}
        </div>
    )
}

export default function ApplicationPanel({ state, reload }) {
    return (
        <>
            <div style={{ ...card, background: '#f8fdf9', marginBottom: '14px', fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6 }}>
                <b style={{ color: '#0d1b12' }}>Applications are open.</b> Pick one position, add a clear photo and write
                your manifesto. Your name, state code, batch and breakout session come from your profile, so fix anything
                wrong there before applications close. You need at least {state.min_months_left} months of service left,
                and you can't run for the position you already hold.
            </div>

            {state.my_application
                ? <MyApplication state={state} onDone={reload} />
                : <ApplyForm state={state} onDone={reload} />}

            <div style={{ ...sectionTitle, marginTop: '18px' }}>Positions in this election</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {state.positions.map(p => (
                    <div key={p.role} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b12', textTransform: 'capitalize' }}>{roleLabel(p.role)}</span>
                        <span style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            {p.holder_first ? `Now: ${p.holder_first} ${p.holder_last}` : 'Vacant'}
                        </span>
                    </div>
                ))}
            </div>
        </>
    )
}